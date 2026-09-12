"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type RealityCameraProps = {
  active: boolean;
  mode?: "world" | "target";
  onCapture: (image: string) => void;
  onClose: () => void;
};

type CameraStatus =
  | "starting"
  | "ready"
  | "capturing"
  | "error";

export default function RealityCamera({
  active,
  mode = "world",
  onCapture,
  onClose,
}: RealityCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  const [status, setStatus] =
    useState<CameraStatus>("starting");

  const [error, setError] = useState("");

  const stopCamera = useCallback(() => {
    const stream = streamRef.current;

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (!active) return;

    setStatus("starting");
    setError("");

    try {
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices?.getUserMedia
      ) {
        throw new Error(
          "Camera access is not available in this browser.",
        );
      }

      stopCamera();

      let stream: MediaStream;

      try {
        stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: {
                ideal: "environment",
              },
              width: {
                ideal: 1920,
              },
              height: {
                ideal: 1080,
              },
            },
            audio: false,
          });
      } catch {
        stream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
      }

      if (!mountedRef.current) {
        stream
          .getTracks()
          .forEach((track) => track.stop());

        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) {
        throw new Error(
          "Camera video element is unavailable.",
        );
      }

      video.srcObject = stream;
      video.muted = true;
      video.playsInline = true;
      video.autoplay = true;

      await new Promise<void>((resolve) => {
        if (video.readyState >= 2) {
          resolve();
          return;
        }

        const handleLoaded = () => {
          video.removeEventListener(
            "loadedmetadata",
            handleLoaded,
          );

          resolve();
        };

        video.addEventListener(
          "loadedmetadata",
          handleLoaded,
        );
      });

      if (!mountedRef.current) return;

      if (video.paused) {
        try {
          await video.play();
        } catch {
          // Chrome may reject play while reloading.
          // The stream itself remains usable.
        }
      }

      if (mountedRef.current) {
        setStatus("ready");
      }
    } catch (cameraError) {
      console.error("CAMERA ERROR:", cameraError);

      if (!mountedRef.current) return;

      setStatus("error");

      setError(
        cameraError instanceof Error
          ? cameraError.message
          : "Unable to access camera.",
      );
    }
  }, [active, stopCamera]);

  useEffect(() => {
    mountedRef.current = true;

    if (active) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      mountedRef.current = false;
      stopCamera();
    };
  }, [active, startCamera, stopCamera]);

  const capture = () => {
    const video = videoRef.current;

    if (!video || status !== "ready") {
      return;
    }

    if (
      video.videoWidth <= 0 ||
      video.videoHeight <= 0
    ) {
      setError("Camera is not ready yet.");
      return;
    }

    setStatus("capturing");

    const canvas = document.createElement("canvas");

    const maxWidth = 1280;
    const scale = Math.min(
      1,
      maxWidth / video.videoWidth,
    );

    canvas.width = Math.round(
      video.videoWidth * scale,
    );

    canvas.height = Math.round(
      video.videoHeight * scale,
    );

    const context = canvas.getContext("2d");

    if (!context) {
      setStatus("ready");
      return;
    }

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const image = canvas.toDataURL(
      "image/jpeg",
      0.82,
    );

    onCapture(image);
  };

  const label =
    mode === "target"
      ? "CAPTURE TARGET"
      : "CAPTURE WORLD";

  return (
    <div className="ru-camera-shell">
      <video
        ref={videoRef}
        className="ru-camera-video"
        autoPlay
        muted
        playsInline
      />

      <div className="ru-camera-overlay">
        <div className="ru-camera-topbar">
          <span className="ru-camera-live">
            <i />
            {status === "ready"
              ? "REALITY LINK ACTIVE"
              : status === "capturing"
                ? "CAPTURING"
                : "CONNECTING"}
          </span>

          <span className="ru-camera-mode">
            {mode === "target"
              ? "TARGET SCAN"
              : "WORLD SCAN"}
          </span>
        </div>

        <div className="ru-camera-reticle">
          <span className="tl" />
          <span className="tr" />
          <span className="bl" />
          <span className="br" />

          <div className="ru-camera-crosshair">
            <i />
          </div>
        </div>

        <div className="ru-camera-scanline" />

        <div className="ru-camera-bottom">
          <div>
            <small>VISION SYSTEM</small>

            <strong>
              {status === "ready"
                ? "READY TO CAPTURE"
                : status === "capturing"
                  ? "READING REALITY..."
                  : "INITIALIZING..."}
            </strong>
          </div>

          <button
            type="button"
            className="ru-camera-capture-button"
            disabled={status !== "ready"}
            onClick={capture}
          >
            <span className="ru-camera-capture-ring">
              <i />
            </span>

            {status === "capturing"
              ? "ANALYZING..."
              : label}

            <span>→</span>
          </button>
        </div>
      </div>

      {status === "error" && (
        <div className="ru-camera-error-overlay">
          <div className="ru-camera-error-card">
            <small>CAMERA SYSTEM</small>

            <h2>Camera Offline</h2>

            <p>
              {error ||
                "Reality Unknown could not access your camera."}
            </p>

            <div>
              <button
                type="button"
                onClick={startCamera}
              >
                TRY AGAIN
              </button>

              <button
                type="button"
                onClick={onClose}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        className="ru-camera-close"
        onClick={() => {
          stopCamera();
          onClose();
        }}
      >
        ESC
      </button>
    </div>
  );
}
