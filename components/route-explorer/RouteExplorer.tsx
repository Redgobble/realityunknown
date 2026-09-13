"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Phase =
  | "idle"
  | "locating"
  | "ready"
  | "analysing"
  | "complete"
  | "error";

type Coordinate = {
  lat: number;
  lon: number;
};

type MapPoint = {
  x: number;
  y: number;
};

type Discovery = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lon: number;
  distanceFromRouteM: number;
  history: string;
  source: string;
  sourceUrl: string;
  imageUrl: string | null;
  period: string | null;
};

type RouteResult = {
  origin: Coordinate & {
    name: string;
    area: string;
  };
  destination: Coordinate & {
    name: string;
    displayName: string;
    city: string | null;
  };
  route: {
    distanceKm: number;
    durationMin: number;
    coordinates: Coordinate[];
  };
  discoveries: Discovery[];
  routeContext: {
    title: string;
    history: string;
    source: string;
    sourceUrl: string;
    imageUrl: string | null;
  } | null;
};

const DELHI_ORIGIN: Coordinate = {
  lat: 28.6139,
  lon: 77.2090,
};

function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${meters} m from route`;
  }

  return `${(meters / 1000).toFixed(1)} km from route`;
}

export default function RouteExplorer() {
  const [phase, setPhase] =
    useState<Phase>("idle");

  const [currentLocation, setCurrentLocation] =
    useState<Coordinate | null>(null);

  const [accuracy, setAccuracy] =
    useState<number | null>(null);

  const [result, setResult] =
    useState<RouteResult | null>(null);

  const [selectedId, setSelectedId] =
    useState<string | null>(null);

  const [error, setError] =
    useState("");

  const [analysisStage, setAnalysisStage] =
    useState(0);

  const [soundOn, setSoundOn] =
    useState(true);

  const musicRef =
    useRef<HTMLAudioElement | null>(null);

  const voiceRef =
    useRef<HTMLAudioElement | null>(null);

  const voiceUrlRef =
    useRef<string | null>(null);

  const speechFallbackRef =
    useRef<SpeechSynthesisUtterance | null>(null);

  const selectedDiscovery = useMemo(
    () =>
      result?.discoveries.find(
        (item) => item.id === selectedId,
      ) ??
      result?.discoveries[0] ??
      null,
    [result, selectedId],
  );

  useEffect(() => {
    return () => {
      musicRef.current?.pause();
      musicRef.current = null;

      voiceRef.current?.pause();
      voiceRef.current = null;

      if (voiceUrlRef.current) {
        URL.revokeObjectURL(
          voiceUrlRef.current,
        );
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "analysing") return;

    const timer = window.setInterval(() => {
      setAnalysisStage(
        (value) => (value + 1) % 4,
      );
    }, 1400);

    return () =>
      window.clearInterval(timer);
  }, [phase]);

  function ensureMusic() {
    if (!soundOn) return;

    if (!musicRef.current) {
      const audio = new Audio(
        "/assets/storybgmusic/storybgmusic.mp3",
      );

      audio.loop = true;
      audio.volume = 0.18;
      musicRef.current = audio;
    }

    void musicRef.current.play().catch(() => {
      // Browser autoplay policy can reject playback
      // until the next user interaction.
    });
  }

  function stopVoice() {
    voiceRef.current?.pause();
    voiceRef.current = null;

    if (voiceUrlRef.current) {
      URL.revokeObjectURL(
        voiceUrlRef.current,
      );
      voiceUrlRef.current = null;
    }

    if (
      typeof window !== "undefined" &&
      "speechSynthesis" in window
    ) {
      window.speechSynthesis.cancel();
    }

    speechFallbackRef.current = null;
  }

  async function speak(text: string) {
    const cleanText = text.trim();

    if (!soundOn || !cleanText) return;

    stopVoice();

    const browserFallback = () => {
      if (
        typeof window === "undefined" ||
        !("speechSynthesis" in window)
      ) {
        return;
      }

      try {
        window.speechSynthesis.cancel();

        const utterance =
          new SpeechSynthesisUtterance(cleanText);

        utterance.rate = 0.94;
        utterance.pitch = 0.92;
        utterance.volume = 1;

        const voices =
          window.speechSynthesis.getVoices();

        const preferredVoice =
          voices.find((voice) =>
            /en[-_](IN|GB|US)/i.test(
              voice.lang,
            ),
          ) ??
          voices.find((voice) =>
            /^en/i.test(voice.lang),
          );

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        speechFallbackRef.current =
          utterance;

        utterance.onend = () => {
          if (
            speechFallbackRef.current ===
            utterance
          ) {
            speechFallbackRef.current = null;
          }
        };

        window.speechSynthesis.speak(
          utterance,
        );
      } catch (error) {
        console.warn(
          "Reality Unknown browser narration failed:",
          error,
        );
      }
    };

    try {
      const response = await fetch(
        "/api/tts",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
          }),
        },
      );

      if (!response.ok) {
        console.warn(
          "Reality Unknown TTS API returned:",
          response.status,
        );

        browserFallback();
        return;
      }

      const contentType =
        response.headers.get(
          "content-type",
        ) ?? "";

      if (
        !contentType.includes(
          "audio/",
        )
      ) {
        console.warn(
          "Reality Unknown TTS returned a non-audio response:",
          contentType,
        );

        browserFallback();
        return;
      }

      const blob =
        await response.blob();

      if (!blob.size) {
        browserFallback();
        return;
      }

      const url =
        URL.createObjectURL(blob);

      voiceUrlRef.current = url;

      const audio =
        new Audio(url);

      audio.preload = "auto";
      audio.volume = 0.98;

      voiceRef.current = audio;

      audio.onended = () => {
        if (
          voiceUrlRef.current ===
          url
        ) {
          URL.revokeObjectURL(
            url,
          );

          voiceUrlRef.current =
            null;
        }

        if (
          voiceRef.current ===
          audio
        ) {
          voiceRef.current =
            null;
        }
      };

      try {
        await audio.play();
      } catch (playError) {
        console.warn(
          "Reality Unknown audio playback was blocked; using browser narration:",
          playError,
        );

        if (
          voiceUrlRef.current ===
          url
        ) {
          URL.revokeObjectURL(
            url,
          );

          voiceUrlRef.current =
            null;
        }

        voiceRef.current = null;

        browserFallback();
      }
    } catch (error) {
      console.warn(
        "Reality Unknown TTS request failed; using browser narration:",
        error,
      );

      browserFallback();
    }
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);

    if (!next) {
      musicRef.current?.pause();
      stopVoice();
      return;
    }

    ensureMusic();
  }

  function locateTraveller() {
    setError("");
    ensureMusic();
    setPhase("locating");

    if (!navigator.geolocation) {
      setError(
        "This browser does not provide live location.",
      );
      setPhase("error");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };

        setCurrentLocation(
          nextLocation,
        );

        setAccuracy(
          position.coords.accuracy,
        );

        setPhase("ready");

        void speak(
          "Live location locked. The journey begins at Delhi, Greater Noida. Your destination has been located. Reveal the route to discover what history lies between these two points.",
        );
      },
      (locationError) => {
        console.error(
          "Geolocation error:",
          locationError,
        );

        setError(
          locationError.code === 1
            ? "Location permission was denied. Allow location access in Chrome and try again."
            : "We could not get a reliable live location. Please try again.",
        );

        setPhase("error");
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      },
    );
  }

  async function revealJourney() {
    if (!currentLocation) {
      locateTraveller();
      return;
    }

    ensureMusic();
    stopVoice();
    setError("");
    setAnalysisStage(0);
    setPhase("analysing");

    try {
      const response =
        await fetch(
          "/api/route-explorer",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              start: DELHI_ORIGIN,
              end: currentLocation,
            }),
          },
        );

      const payload =
        (await response.json()) as {
          success?: boolean;
          data?: RouteResult;
          error?: string;
        };

      if (
        !response.ok ||
        !payload.success ||
        !payload.data
      ) {
        throw new Error(
          payload.error ??
            "The route could not be reconstructed.",
        );
      }

      setResult(payload.data);
      setSelectedId(
        payload.data.discoveries[0]?.id ??
          null,
      );
      setPhase("complete");

      const destination =
        payload.data.destination.name;

      void speak(
        `Journey decoded. You travelled ${payload.data.route.distanceKm} kilometres from Delhi to ${destination}. The route takes about ${payload.data.route.durationMin} minutes. ${
          payload.data.discoveries.length
        } verified historical ${
          payload.data.discoveries.length === 1
            ? "discovery was"
            : "discoveries were"
        } found along the route. Select a discovery to hear its verified history.`,
      );
    } catch (routeError) {
      console.error(
        "Route Explorer error:",
        routeError,
      );

      setError(
        routeError instanceof Error
          ? routeError.message
          : "Route reconstruction failed.",
      );

      setPhase("error");
    }
  }

  function resetRoute() {
    stopVoice();
    setResult(null);
    setCurrentLocation(null);
    setAccuracy(null);
    setSelectedId(null);
    setError("");
    setPhase("idle");
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function speakDiscovery(
    discovery: Discovery,
  ) {
    const narration = [
      discovery.name,
      discovery.category,
      discovery.history,
    ]
      .filter(Boolean)
      .join(". ");

    void speak(narration);
  }

  const routePoints =
    result?.route.coordinates ?? [];

  const mapBounds = useMemo(() => {
    if (!routePoints.length) return null;

    const lats = routePoints.map(
      (point) => point.lat,
    );
    const lons = routePoints.map(
      (point) => point.lon,
    );

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    return {
      minLat:
        minLat -
        Math.max(
          (maxLat - minLat) * 0.12,
          0.001,
        ),
      maxLat:
        maxLat +
        Math.max(
          (maxLat - minLat) * 0.12,
          0.001,
        ),
      minLon:
        minLon -
        Math.max(
          (maxLon - minLon) * 0.12,
          0.001,
        ),
      maxLon:
        maxLon +
        Math.max(
          (maxLon - minLon) * 0.12,
          0.001,
        ),
    };
  }, [routePoints]);

  function project(point: Coordinate) {
    if (!mapBounds) {
      return {
        x: 500,
        y: 250,
      };
    }

    const x =
      ((point.lon - mapBounds.minLon) /
        (mapBounds.maxLon -
          mapBounds.minLon)) *
      1000;

    const y =
      (1 -
        (point.lat - mapBounds.minLat) /
          (mapBounds.maxLat -
            mapBounds.minLat)) *
      520;

    return {
      x,
      y,
    };
  }

  const routePath = routePoints
    .map((point, index) => {
      const position =
        project(point);

      return `${
        index === 0 ? "M" : "L"
      } ${position.x.toFixed(
        2,
      )} ${position.y.toFixed(2)}`;
    })
    .join(" ");

  const discoveryMarkerPositions = (() => {
    if (!result?.discoveries.length) return new Map<string, MapPoint>();

    const points = result.discoveries.map((discovery) => ({
      id: discovery.id,
      point: project({
        lat: discovery.lat,
        lon: discovery.lon,
      }),
    }));
    const groups: Array<typeof points> = [];
    const visited = new Set<string>();

    points.forEach((entry) => {
      if (visited.has(entry.id)) return;

      const group: typeof points = [];
      const queue = [entry];

      while (queue.length) {
        const current = queue.shift();
        if (!current || visited.has(current.id)) continue;

        visited.add(current.id);
        group.push(current);

        points.forEach((candidate) => {
          if (
            !visited.has(candidate.id) &&
            Math.abs(candidate.point.x - current.point.x) < 70 &&
            Math.abs(candidate.point.y - current.point.y) < 55
          ) {
            queue.push(candidate);
          }
        });
      }

      groups.push(group);
    });

    const positions = new Map<string, MapPoint>();
    const occupied: MapPoint[] = [];
    const endpointPoints = routePoints.length
      ? [
          project(routePoints[0]),
          project(routePoints[routePoints.length - 1]),
        ]
      : [];

    groups.forEach((group, groupIndex) => {
      const center = group.reduce(
        (sum, entry) => ({
          x: sum.x + entry.point.x / group.length,
          y: sum.y + entry.point.y / group.length,
        }),
        { x: 0, y: 0 },
      );
      const radius = group.length > 1 ? 118 : 52;

      group.forEach((entry, index) => {
        let candidate = entry.point;

        for (let attempt = 0; attempt < 12; attempt += 1) {
          const angle =
              (group.length > 1
              ? -Math.PI / 2 +
                (index * Math.PI * 2) / group.length
              : -Math.PI / 2 + (groupIndex % 4) * (Math.PI / 2)) +
            attempt * 0.42;
          const distance = radius + attempt * 18;

          candidate = {
            x: Math.max(
              48,
              Math.min(952, center.x + Math.cos(angle) * distance),
            ),
            y: Math.max(
              48,
              Math.min(472, center.y + Math.sin(angle) * distance),
            ),
          };

          const clearOfMarkers = occupied.every(
            (point) =>
              Math.hypot(point.x - candidate.x, point.y - candidate.y) > 104,
          );
          const clearOfEndpoints = endpointPoints.every(
            (point) =>
              Math.hypot(point.x - candidate.x, point.y - candidate.y) > 142,
          );

          if (clearOfMarkers && clearOfEndpoints) break;
        }

        occupied.push(candidate);
        positions.set(entry.id, candidate);
      });
    });

    return positions;
  })();

  const destinationLabel =
    result?.destination.name ??
    "Your location";

  return (
    <main className="rx2-page">
      <div className="rx2-bg" />
      <div className="rx2-vignette" />
      <div className="rx2-noise" />

      <header className="rx2-header">
        <Link
          href="/"
          className="rx2-brand"
          aria-label="Back to Reality Unknown"
        >
          <img
            src="/assets/applogo/reality_unknown_logo.png"
            alt="Reality Unknown"
          />
        </Link>

        <div className="rx2-status">
          <span className="rx2-status-dot" />
          ROUTE INTELLIGENCE
          <b>ACTIVE</b>
        </div>

        <div className="rx2-header-actions">
          <button
            type="button"
            onClick={toggleSound}
            className="rx2-sound"
          >
            {soundOn ? "SOUND ON" : "SOUND OFF"}
          </button>

          <Link
            href="/"
            className="rx2-exit"
          >
            EXIT ↗
          </Link>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {phase === "idle" && (
          <motion.section
            key="idle"
            className="rx2-launch"
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -18,
            }}
          >
            <div className="rx2-kicker">
              TRAVELLER MODE / FIELD CHAPTER
            </div>

            <h1>
              Follow the road.
              <em>
                Recover the history.
              </em>
            </h1>

            <p className="rx2-lead">
              Start at Delhi. Reality
              Unknown maps your live journey
              and looks for verified historical
              places along the route.
            </p>

            <div className="rx2-route-brief">
              <div className="rx2-point">
                <span className="rx2-point-letter">
                  A
                </span>
                <div>
                  <small>
                    ROUTE ORIGIN
                  </small>
                  <strong>
                    DELHI
                  </strong>
                  <span>
                    GREATER NOIDA
                  </span>
                </div>
              </div>

              <div className="rx2-connector">
                <i />
                <i />
                <i />
                <span>LIVE</span>
              </div>

              <div className="rx2-point">
                <span className="rx2-point-letter">
                  B
                </span>
                <div>
                  <small>
                    DESTINATION
                  </small>
                  <strong>
                    YOUR LOCATION
                  </strong>
                  <span>
                    LIVE GPS
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="rx2-primary"
              onClick={locateTraveller}
            >
              <span>
                FIND MY LOCATION
              </span>
              <b>→</b>
            </button>

            <div className="rx2-trust">
              <span>GPS</span>
              <i />
              <span>
                LOCATION STAYS IN YOUR
                BROWSER UNTIL ROUTE IS
                REQUESTED
              </span>
            </div>
          </motion.section>
        )}

        {phase === "locating" && (
          <motion.section
            key="locating"
            className="rx2-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="rx2-radar">
              <span />
              <span />
              <span />
              <b>GPS</b>
            </div>

            <div className="rx2-kicker">
              LIVE LOCATION / ACQUIRING
            </div>

            <h2>
              Finding where
              <em>you are.</em>
            </h2>

            <p>
              Hold for a moment. Reality
              Unknown is requesting a precise
              browser location so the journey
              can end exactly where you are.
            </p>
          </motion.section>
        )}

        {phase === "ready" &&
          currentLocation && (
            <motion.section
              key="ready"
              className="rx2-ready"
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -18,
              }}
            >
              <div className="rx2-kicker">
                LIVE LOCATION / LOCKED
              </div>

              <div className="rx2-ready-grid">
                <div>
                  <h2>
                    The destination
                    <em>is found.</em>
                  </h2>

                  <p>
                    Your current position
                    will be used only as the
                    end of this demo route.
                  </p>

                  <div className="rx2-live-location">
                    <span className="rx2-live-dot" />
                    <div>
                      <small>
                        YOUR LOCATION
                      </small>
                      <strong>
                        LIVE LOCATION
                      </strong>
                      <span>
                        GPS LOCKED
                        {accuracy
                          ? ` • ±${Math.round(
                              accuracy,
                            )} m`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rx2-journey-preview">
                  <span>A</span>
                  <strong>
                    DELHI
                  </strong>
                  <i />
                  <span>B</span>
                  <strong>
                    YOUR LOCATION
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="rx2-primary rx2-primary-wide"
                onClick={revealJourney}
              >
                <span>
                  REVEAL MY JOURNEY
                </span>
                <b>↗</b>
              </button>
            </motion.section>
          )}

        {phase === "analysing" && (
          <motion.section
            key="analysing"
            className="rx2-state rx2-analysis"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="rx2-analysis-orbit">
              <div className="rx2-analysis-core">
                <img
                  src="/assets/applogo/reality_unknown_logo.png"
                  alt="Reality Unknown"
                />
              </div>
              <i />
              <i />
              <i />
            </div>

            <div className="rx2-kicker">
              JOURNEY DECODED / BUILDING
            </div>

            <h2>
              Reading the road
              <em>between you.</em>
            </h2>

            <div className="rx2-analysis-steps">
              {[
                "MAPPING THE ROUTE",
                "SEARCHING HISTORICAL RECORDS",
                "VERIFYING PLACES",
                "BUILDING YOUR CHAPTER",
              ].map(
                (step, index) => (
                  <div
                    key={step}
                    className={
                      index <=
                      analysisStage
                        ? "active"
                        : ""
                    }
                  >
                    <span>
                      0{index + 1}
                    </span>
                    <strong>
                      {step}
                    </strong>
                    <i />
                  </div>
                ),
              )}
            </div>
          </motion.section>
        )}

        {phase === "error" && (
          <motion.section
            key="error"
            className="rx2-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="rx2-error-mark">
              !
            </div>

            <div className="rx2-kicker">
              ROUTE INTELLIGENCE / SIGNAL LOST
            </div>

            <h2>
              We could not
              <em>decode the journey.</em>
            </h2>

            <p>{error}</p>

            <div className="rx2-error-actions">
              <button
                type="button"
                className="rx2-primary"
                onClick={locateTraveller}
              >
                TRY AGAIN
                <b>↻</b>
              </button>

              <Link
                href="/"
                className="rx2-secondary"
              >
                RETURN HOME
              </Link>
            </div>
          </motion.section>
        )}

        {phase === "complete" &&
          result && (
            <motion.section
              key="complete"
              className="rx2-results"
              initial={{
                opacity: 0,
                y: 18,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
            >
              <div className="rx2-results-hero">
                <div>
                  <div className="rx2-kicker">
                    JOURNEY DECODED
                  </div>

                  <h2>
                    Your route
                    <em>
                      has a history.
                    </em>
                  </h2>

                  <p>
                    Delhi →{" "}
                    {destinationLabel}
                  </p>
                </div>

                <div className="rx2-stats">
                  <div>
                    <small>
                      DISTANCE
                    </small>
                    <strong>
                      {result.route.distanceKm}
                      <span> km</span>
                    </strong>
                  </div>

                  <div>
                    <small>
                      EST. TRAVEL
                    </small>
                    <strong>
                      {result.route.durationMin}
                      <span> min</span>
                    </strong>
                  </div>

                  <div>
                    <small>
                      VERIFIED HISTORY
                    </small>
                    <strong>
                      {result.discoveries.length}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="rx-route-map-shell">
                <div className="rx-route-map-hud">
                  <span>
                    ROUTE / A → B
                  </span>
                  <span>
                    DELHI
                    <i />
                    {destinationLabel}
                  </span>
                </div>

                <div className="rx-route-map">
                  <div className="rx-route-map-grid" />

                  <svg
                    viewBox="0 0 1000 520"
                    preserveAspectRatio="none"
                    aria-label="Journey route map"
                  >

                    {/* =====================================================
                        ROUTE
                        Existing routePath is completely preserved.
                       ===================================================== */}

                    <path
                      d={routePath}
                      className="rx-route-map-route-glow"
                    />

                    <path
                      d={routePath}
                      className="rx-route-map-route"
                    />


                    {/* =====================================================
                        DISCOVERY MARKERS
                       ===================================================== */}

                    {result.discoveries.map(
                      (discovery, index) => {
                        const position = project({
                          lat: discovery.lat,
                          lon: discovery.lon,
                        });

                        /*
                         * Visual offsets.
                         * The small anchor remains at the exact
                         * geographic coordinate.
                         */
                        const markerPosition =
                          discoveryMarkerPositions.get(
                            discovery.id,
                          ) ?? position;

                        const markerX = markerPosition.x;
                        const markerY = markerPosition.y;

                        const active =
                          selectedId ===
                          discovery.id;

                        const category =
                          (
                            discovery.category ||
                            ""
                          ).toLowerCase();

                        const tomb =
                          category.includes(
                            "tomb",
                          ) ||
                          category.includes(
                            "mausoleum",
                          );

                        const museum =
                          category.includes(
                            "museum",
                          );

                        const archaeology =
                          category.includes(
                            "archaeolog",
                          ) ||
                          category.includes(
                            "heritage",
                          ) ||
                          category.includes(
                            "site",
                          );

                        const attraction =
                          category.includes(
                            "attraction",
                          );

                        const number =
                          String(index + 1).padStart(
                            2,
                            "0",
                          );

                        return (
                          <g
                            key={discovery.id}
                            className={
                              active
                                ? "rx-route-map-discovery active"
                                : "rx-route-map-discovery"
                            }
                            onClick={() => {
                              setSelectedId(
                                discovery.id,
                              );
                            }}
                            role="button"
                            tabIndex={0}
                          >

                            <title>
                              {`${number} — ${discovery.name}`}
                            </title>


                            {/* REAL LOCATION */}

                            <circle
                              cx={position.x}
                              cy={position.y}
                              r="3"
                              className="rx-route-map-anchor"
                            />

                            <circle
                              cx={position.x}
                              cy={position.y}
                              r="7"
                              className="rx-route-map-anchor-ring"
                            />


                            {/* CONNECTOR */}

                            <line
                              x1={position.x}
                              y1={position.y}
                              x2={markerX}
                              y2={markerY}
                              className="rx-route-map-connector"
                            />


                            {/* MARKER BACKPLATE */}

                            <circle
                              cx={markerX}
                              cy={markerY}
                              r={
                                active
                                  ? 25
                                  : 21
                              }
                              className="rx-route-map-halo"
                            />

                            <circle
                              cx={markerX}
                              cy={markerY}
                              r="16"
                              className="rx-route-map-back"
                            />


                            {/* =================================================
                                TOMB — ARCH
                               ================================================= */}

                            {tomb ? (
                              <path
                                d={`
                                  M ${markerX - 8}
                                    ${markerY + 8}
                                  L ${markerX - 8}
                                    ${markerY - 1}
                                  Q ${markerX}
                                    ${markerY - 12}
                                    ${markerX + 8}
                                    ${markerY - 1}
                                  L ${markerX + 8}
                                    ${markerY + 8}
                                `}
                                className="rx-route-map-icon rx-route-map-tomb"
                              />

                            ) : museum ? (

                              /* MUSEUM — SQUARE */

                              <rect
                                x={markerX - 8}
                                y={markerY - 8}
                                width="16"
                                height="16"
                                rx="2"
                                className="rx-route-map-icon rx-route-map-museum"
                              />

                            ) : archaeology ? (

                              /* ARCHAEOLOGICAL — HEXAGON */

                              <polygon
                                points={`
                                  ${markerX},${markerY - 11}
                                  ${markerX + 10},${markerY - 5}
                                  ${markerX + 8},${markerY + 7}
                                  ${markerX},${markerY + 12}
                                  ${markerX - 8},${markerY + 7}
                                  ${markerX - 10},${markerY - 5}
                                `}
                                className="rx-route-map-icon rx-route-map-archaeology"
                              />

                            ) : attraction ? (

                              /* ATTRACTION — STAR */

                              <polygon
                                points={`
                                  ${markerX},${markerY - 12}
                                  ${markerX + 3.5},${markerY - 4}
                                  ${markerX + 12},${markerY - 4}
                                  ${markerX + 5},${markerY + 2}
                                  ${markerX + 8},${markerY + 11}
                                  ${markerX},${markerY + 6}
                                  ${markerX - 8},${markerY + 11}
                                  ${markerX - 5},${markerY + 2}
                                  ${markerX - 12},${markerY - 4}
                                  ${markerX - 3.5},${markerY - 4}
                                `}
                                className="rx-route-map-icon rx-route-map-attraction"
                              />

                            ) : (

                              /* MONUMENT — DIAMOND */

                              <polygon
                                points={`
                                  ${markerX},${markerY - 12}
                                  ${markerX + 12},${markerY}
                                  ${markerX},${markerY + 12}
                                  ${markerX - 12},${markerY}
                                `}
                                className="rx-route-map-icon rx-route-map-monument"
                              />
                            )}


                            {/* CORE */}

                            <circle
                              cx={markerX}
                              cy={markerY}
                              r={
                                active
                                  ? 4
                                  : 3
                              }
                              className="rx-route-map-core"
                            />


                            {/* NUMBER BADGE */}

                            <g
                              transform={`translate(${markerX + 17} ${markerY - 17})`}
                              className="rx-route-map-number"
                            >
                              <rect
                                x="-14"
                                y="-8"
                                width="28"
                                height="16"
                                rx="3"
                              />

                              <text
                                x="0"
                                y="3"
                                textAnchor="middle"
                              >
                                {number}
                              </text>
                            </g>

                          </g>
                        );
                      },
                    )}


                    {/* =====================================================
                        DELHI — EXACT FIRST ROUTE POINT
                       ===================================================== */}

                    {routePoints.length > 1 &&
                      (() => {
                        const start = project(
                          routePoints[0],
                        );

                        const end = project(
                          routePoints[
                            routePoints.length - 1
                          ],
                        );

                        return (
                          <>

                            {/* DELHI */}

                            <g
                              className="rx-route-map-endpoint rx-route-map-origin"
                              transform={`translate(${start.x} ${start.y})`}
                            >

                              <circle
                                r="31"
                                className="rx-route-map-endpoint-pulse"
                              />

                              <circle
                                r="20"
                                className="rx-route-map-origin-ring"
                              />

                              <circle
                                r="10"
                                className="rx-route-map-origin-inner"
                              />

                              <circle
                                r="4"
                                className="rx-route-map-origin-light"
                              />

                              <g
                                transform="translate(-92 -38)"
                              >

                                <rect
                                  width="82"
                                  height="28"
                                  rx="4"
                                  className="rx-route-map-endpoint-label"
                                />

                                <text
                                  x="41"
                                  y="18"
                                  textAnchor="middle"
                                  className="rx-route-map-endpoint-text"
                                >
                                  DELHI
                                </text>

                              </g>

                            </g>


                            {/* YOU */}

                            <g
                              className="rx-route-map-endpoint rx-route-map-destination"
                              transform={`translate(${end.x} ${end.y})`}
                            >

                              <circle
                                r="34"
                                className="rx-route-map-endpoint-pulse live"
                              />

                              <circle
                                r="21"
                                className="rx-route-map-live-ring"
                              />

                              <circle
                                r="10"
                                className="rx-route-map-live-inner"
                              />

                              <circle
                                r="4"
                                className="rx-route-map-live-light"
                              />

                              <g
                                transform="translate(-108 -16)"
                              >

                                <rect
                                  width="82"
                                  height="28"
                                  rx="4"
                                  className="rx-route-map-endpoint-label live"
                                />

                                <text
                                  x="41"
                                  y="18"
                                  textAnchor="middle"
                                  className="rx-route-map-endpoint-text live"
                                >
                                  YOU
                                </text>

                              </g>

                            </g>

                          </>
                        );
                      })()}

                  </svg>

                  <div className="rx-route-map-legend">
                    <span className="rx-route-map-legend-title">
                      DISCOVERY TYPES
                    </span>
                    <span>
                      <i className="rx-route-map-legend-icon monument" />
                      MONUMENT
                    </span>
                    <span>
                      <i className="rx-route-map-legend-icon tomb" />
                      TOMB
                    </span>
                    <span>
                      <i className="rx-route-map-legend-icon archaeology" />
                      ARCHAEOLOGICAL
                    </span>
                    <span>
                      <i className="rx-route-map-legend-icon attraction" />
                      ATTRACTION
                    </span>
                  </div>



                  <a
                    className="rx-route-map-attribution"
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Map data © OpenStreetMap contributors
                  </a>
                </div>
              </div>

              <div className="rx2-route-dossier">
                <div className="rx2-dossier-main">
                  <div className="rx2-section-head">
                    <div>
                      <span>
                        01 / WHAT YOU PASSED
                      </span>
                      <h3>
                        Historical
                        <em>
                          discoveries.
                        </em>
                      </h3>
                    </div>

                    <button
                      type="button"
                      className="rx2-listen"
                      onClick={() => {
                        if (selectedDiscovery) {
                          speakDiscovery(
                            selectedDiscovery,
                          );
                        }
                      }}
                    >
                      ◉ LISTEN TO SELECTED
                    </button>
                  </div>

                  {result.discoveries.length >
                  0 ? (
                    <div className="rx2-discovery-list">
                      {result.discoveries.map(
                        (
                          discovery,
                          index,
                        ) => (
                          <button
                            type="button"
                            key={
                              discovery.id
                            }
                            className={
                              selectedId ===
                              discovery.id
                                ? "rx2-discovery active"
                                : "rx2-discovery"
                            }
                            onClick={() => {
                              setSelectedId(
                                discovery.id,
                              );
                              speakDiscovery(
                                discovery,
                              );
                            }}
                          >
                            <span className="rx2-discovery-index">
                              {String(
                                index + 1,
                              ).padStart(
                                2,
                                "0",
                              )}
                            </span>

                            <span className="rx2-discovery-copy">
                              <small>
                                {discovery.category.toUpperCase()}
                              </small>

                              <strong>
                                {
                                  discovery.name
                                }
                              </strong>

                              <span>
                                {formatDistance(
                                  discovery.distanceFromRouteM,
                                )}
                              </span>
                            </span>

                            <span className="rx2-discovery-arrow">
                              ↗
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="rx2-empty-history">
                      <span>
                        NO VERIFIED SITE
                      </span>
                      <strong>
                        This route segment
                        did not contain a
                        historical record
                        strong enough to
                        display.
                      </strong>
                      <p>
                        Reality Unknown will
                        never invent a landmark
                        just to fill the map.
                      </p>
                    </div>
                  )}
                </div>

                <aside className="rx2-dossier-side">
                  <AnimatePresence
                    mode="wait"
                  >
                    {selectedDiscovery ? (
                      <motion.div
                        key={
                          selectedDiscovery.id
                        }
                        className="rx2-history-card"
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                      >
                        <div className="rx2-history-card-top">
                          <span>
                            HISTORY RECORD
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              speakDiscovery(
                                selectedDiscovery,
                              )
                            }
                            aria-label="Read history aloud"
                          >
                            🔊
                          </button>
                        </div>

                        {selectedDiscovery.imageUrl ? (
                          <img
                            src={
                              selectedDiscovery.imageUrl
                            }
                            alt={
                              selectedDiscovery.name
                            }
                            className="rx2-history-image"
                            loading="eager"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="rx2-history-image-fallback">
                            <img
                              src="/assets/applogo/reality_unknown_logo.png"
                              alt=""
                            />
                            <span>
                              VERIFIED HISTORY RECORD
                            </span>
                          </div>
                        )}

                        <h4>
                          {
                            selectedDiscovery.name
                          }
                        </h4>

                        <div className="rx2-history-meta">
                          <span>
                            {selectedDiscovery.category.toUpperCase()}
                          </span>

                          {selectedDiscovery.period && (
                            <span>
                              {
                                selectedDiscovery.period
                              }
                            </span>
                          )}
                        </div>

                        <p>
                          {
                            selectedDiscovery.history
                          }
                        </p>

                        <div className="rx2-history-source">
                          <span>
                            SOURCE
                          </span>

                          <a
                            href={
                              selectedDiscovery.sourceUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            {
                              selectedDiscovery.source
                            }{" "}
                            ↗
                          </a>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="route-context"
                        className="rx2-context-card"
                        initial={{
                          opacity: 0,
                        }}
                        animate={{
                          opacity: 1,
                        }}
                      >
                        <span>
                          ROUTE CONTEXT
                        </span>

                        <h4>
                          {result.routeContext
                            ?.title ??
                            "The story between the points"}
                        </h4>

                        <p>
                          {result.routeContext
                            ?.history ??
                            "Select a discovery on the route to open its verified historical record."}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </aside>
              </div>

              {result.routeContext && (
                <section className="rx2-context-strip">
                  <div className="rx2-context-number">
                    02
                  </div>

                  <div>
                    <span>
                      THE LARGER STORY
                    </span>

                    <h3>
                      {
                        result.routeContext
                          .title
                      }
                    </h3>

                    <p>
                      {
                        result.routeContext
                          .history
                      }
                    </p>

                    <a
                      href={
                        result.routeContext
                          .sourceUrl
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      OPEN HISTORICAL RECORD ↗
                    </a>
                  </div>
                </section>
              )}

              <div className="rx2-final">
                <span>
                  REALITY UNKNOWN
                </span>

                <h3>
                  You did not just
                  <em>travel through it.</em>
                </h3>

                <p>
                  You travelled through
                  a layer of its history.
                </p>

                <div className="rx2-final-actions">
                  <button
                    type="button"
                    className="rx2-primary"
                    onClick={resetRoute}
                  >
                    EXPLORE ANOTHER ROUTE
                    <b>↻</b>
                  </button>

                  <Link
                    href="/"
                    className="rx2-secondary"
                  >
                    RETURN TO REALITY
                  </Link>
                </div>
              </div>

              <footer className="rx2-footer">
                <span>
                  Route geometry:
                  OpenStreetMap /
                  OSRM
                </span>

                <span>
                  Historical records:
                  Wikimedia
                </span>

                <span>
                  © Reality Unknown
                </span>
              </footer>
            </motion.section>
          )}
      </AnimatePresence>
    </main>
  );
}
