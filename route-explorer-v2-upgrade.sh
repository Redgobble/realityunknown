#!/bin/bash
set -euo pipefail

PROJECT="/Users/sanjaypandey/Desktop/realityunknown_v2"
cd "$PROJECT"

echo "== Reality Unknown / Route Explorer v2 =="

mkdir -p components/route-explorer app/api/route-explorer

STAMP="$(date +%Y%m%d-%H%M%S)"
cp components/route-explorer/RouteExplorer.tsx "components/route-explorer/RouteExplorer.tsx.backup-$STAMP" 2>/dev/null || true
cp app/api/route-explorer/route.ts "app/api/route-explorer/route.ts.backup-$STAMP" 2>/dev/null || true

cat > app/api/route-explorer/route.ts <<'EOF'
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Coordinate = {
  lat: number;
  lon: number;
};

type OSMElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
};

type WikipediaSummary = {
  title: string;
  extract: string;
  url: string;
  thumbnail?: string;
};

const START: Coordinate = {
  lat: 28.4653,
  lon: 77.5117,
};

const OSM_HEADERS = {
  "User-Agent":
    "RealityUnknown/1.0 (route explorer demo; local development)",
  Accept: "application/json",
};

function validCoordinate(value: unknown): value is Coordinate {
  if (!value || typeof value !== "object") return false;
  const point = value as Record<string, unknown>;
  return (
    typeof point.lat === "number" &&
    typeof point.lon === "number" &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lon) &&
    Math.abs(point.lat) <= 90 &&
    Math.abs(point.lon) <= 180
  );
}

async function fetchJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...OSM_HEADERS,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`External service returned ${response.status}`);
  }

  return (await response.json()) as T;
}

function haversine(a: Coordinate, b: Coordinate) {
  const earthRadius = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLon / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);

  return 2 * earthRadius * Math.asin(Math.sqrt(h));
}

function pointToSegmentDistance(
  point: Coordinate,
  a: Coordinate,
  b: Coordinate,
) {
  const latScale = 111320;
  const lonScale = 111320 * Math.cos((point.lat * Math.PI) / 180);

  const px = point.lon * lonScale;
  const py = point.lat * latScale;
  const ax = a.lon * lonScale;
  const ay = a.lat * latScale;
  const bx = b.lon * lonScale;
  const by = b.lat * latScale;

  const dx = bx - ax;
  const dy = by - ay;

  if (dx === 0 && dy === 0) {
    return Math.hypot(px - ax, py - ay);
  }

  const t = Math.max(
    0,
    Math.min(
      1,
      ((px - ax) * dx + (py - ay) * dy) /
        (dx * dx + dy * dy),
    ),
  );

  const closestX = ax + t * dx;
  const closestY = ay + t * dy;

  return Math.hypot(px - closestX, py - closestY);
}

function pointToRouteDistance(
  point: Coordinate,
  route: Coordinate[],
) {
  let best = Number.POSITIVE_INFINITY;

  for (let index = 1; index < route.length; index += 1) {
    best = Math.min(
      best,
      pointToSegmentDistance(
        point,
        route[index - 1],
        route[index],
      ),
    );
  }

  return best;
}

function getElementPoint(element: OSMElement): Coordinate | null {
  if (
    typeof element.lat === "number" &&
    typeof element.lon === "number"
  ) {
    return {
      lat: element.lat,
      lon: element.lon,
    };
  }

  if (element.center) {
    return element.center;
  }

  return null;
}

function normalizeWikipediaTag(value?: string) {
  if (!value) return null;

  const separator = value.indexOf(":");

  if (separator > 0) {
    const language = value.slice(0, separator);
    if (language.length <= 5) {
      return value.slice(separator + 1);
    }
  }

  return value;
}

async function getWikidataWikipediaTitle(
  wikidata?: string,
) {
  if (!wikidata || !/^Q\d+$/i.test(wikidata)) {
    return null;
  }

  try {
    const data = await fetchJson<{
      entities?: Record<
        string,
        {
          sitelinks?: {
            enwiki?: {
              title?: string;
            };
          };
        }
      >;
    }>(
      `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(
        wikidata,
      )}.json?flavor=simple`,
      {
        headers: {
          "User-Agent":
            "RealityUnknown/1.0 (route explorer demo)",
        },
      },
    );

    return (
      data.entities?.[wikidata]?.sitelinks?.enwiki
        ?.title ?? null
    );
  } catch {
    return null;
  }
}

async function getWikipediaSummary(
  title: string,
): Promise<WikipediaSummary | null> {
  try {
    const data = await fetchJson<{
      title?: string;
      extract?: string;
      content_urls?: {
        desktop?: {
          page?: string;
        };
      };
      thumbnail?: {
        source?: string;
      };
    }>(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        title.replaceAll(" ", "_"),
      )}`,
      {
        headers: {
          "User-Agent":
            "RealityUnknown/1.0 (route explorer demo)",
        },
      },
    );

    if (!data.extract || !data.title) {
      return null;
    }

    return {
      title: data.title,
      extract: data.extract,
      url:
        data.content_urls?.desktop?.page ??
        `https://en.wikipedia.org/wiki/${encodeURIComponent(
          data.title.replaceAll(" ", "_"),
        )}`,
      thumbnail: data.thumbnail?.source,
    };
  } catch {
    return null;
  }
}

async function searchWikipediaTitle(query: string) {
  try {
    const data = await fetchJson<{
      query?: {
        search?: Array<{
          title?: string;
        }>;
      };
    }>(
      `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        query,
      )}&format=json&utf8=1&srlimit=5`,
      {
        headers: {
          "User-Agent":
            "RealityUnknown/1.0 (route explorer demo)",
        },
      },
    );

    return data.query?.search?.[0]?.title ?? null;
  } catch {
    return null;
  }
}

function getLocationLabel(address: Record<string, unknown> | undefined) {
  if (!address) return "Live location";

  const locality =
    String(
      address.suburb ??
        address.neighbourhood ??
        address.quarter ??
        "",
    ).trim();

  const city = String(
    address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      address.county ??
      "",
  ).trim();

  const state = String(
    address.state ?? "",
  ).trim();

  const primary = [locality, city].filter(Boolean).join(", ");

  if (primary) return primary;
  if (city) return city;
  if (state) return state;

  return "Live location";
}

async function reverseGeocode(point: Coordinate) {
  try {
    const data = await fetchJson<{
      display_name?: string;
      address?: Record<string, unknown>;
    }>(
      `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
        point.lat,
      )}&lon=${encodeURIComponent(
        point.lon,
      )}&format=jsonv2&addressdetails=1&zoom=18&extratags=1`,
      {
        headers: {
          "User-Agent":
            "RealityUnknown/1.0 (route explorer demo; local development)",
          Referer: "http://localhost:3000/route-explorer",
        },
      },
    );

    return {
      name: getLocationLabel(data.address),
      displayName:
        data.display_name ?? getLocationLabel(data.address),
      city:
        String(
          data.address?.city ??
            data.address?.town ??
            data.address?.village ??
            data.address?.municipality ??
            data.address?.county ??
            "",
        ).trim() || null,
    };
  } catch {
    return {
      name: "Live location",
      displayName: "Your current location",
      city: null,
    };
  }
}

async function findHistoricalPlaces(
  route: Coordinate[],
) {
  const lats = route.map((point) => point.lat);
  const lons = route.map((point) => point.lon);

  const south = Math.min(...lats) - 0.018;
  const north = Math.max(...lats) + 0.018;
  const west = Math.min(...lons) - 0.018;
  const east = Math.max(...lons) + 0.018;

  const bbox = `${south},${west},${north},${east}`;

  const query = `
[out:json][timeout:25];
(
  nwr["historic"](${bbox});
  nwr["heritage"](${bbox});
  nwr["tourism"~"^(museum|attraction)$"](${bbox});
  nwr["man_made"~"^(monument|memorial)$"](${bbox});
);
out center tags;
`;

  let elements: OSMElement[] = [];

  try {
    const data = await fetchJson<{
      elements?: OSMElement[];
    }>("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent":
          "RealityUnknown/1.0 (route explorer demo)",
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    elements = data.elements ?? [];
  } catch {
    return [];
  }

  const candidates = elements
    .map((element) => {
      const point = getElementPoint(element);
      const tags = element.tags ?? {};
      const name =
        tags.name ??
        tags["name:en"] ??
        tags["official_name"];

      if (!point || !name) return null;

      const historic = tags.historic;
      const heritage = tags.heritage;
      const tourism = tags.tourism;
      const manMade = tags.man_made;
      const hasWiki =
        Boolean(tags.wikipedia) ||
        Boolean(tags.wikidata);

      const eligible =
        Boolean(historic) ||
        Boolean(heritage) ||
        tourism === "museum" ||
        tourism === "attraction" ||
        manMade === "monument" ||
        manMade === "memorial";

      if (!eligible) return null;

      const routeDistance = pointToRouteDistance(
        point,
        route,
      );

      if (routeDistance > 1800) return null;

      let score = 0;

      if (historic) score += 4;
      if (heritage) score += 4;
      if (tourism === "museum") score += 3;
      if (tourism === "attraction") score += 2;
      if (manMade === "monument") score += 3;
      if (manMade === "memorial") score += 3;
      if (hasWiki) score += 4;
      if (tags.start_date) score += 1;

      return {
        element,
        point,
        name,
        tags,
        routeDistance,
        score,
      };
    })
    .filter(
      (
        item,
      ): item is {
        element: OSMElement;
        point: Coordinate;
        name: string;
        tags: Record<string, string>;
        routeDistance: number;
        score: number;
      } => Boolean(item),
    );

  const deduped = Array.from(
    new Map(
      candidates.map((candidate) => [
        candidate.name.toLowerCase(),
        candidate,
      ]),
    ).values(),
  );

  deduped.sort(
    (a, b) =>
      b.score - a.score ||
      a.routeDistance - b.routeDistance,
  );

  const topCandidates = deduped.slice(0, 8);

  const hydrated = await Promise.all(
    topCandidates.map(async (candidate) => {
      let wikipediaTitle = normalizeWikipediaTag(
        candidate.tags.wikipedia,
      );

      if (!wikipediaTitle) {
        wikipediaTitle =
          await getWikidataWikipediaTitle(
            candidate.tags.wikidata,
          );
      }

      let wikipedia = wikipediaTitle
        ? await getWikipediaSummary(wikipediaTitle)
        : null;

      if (!wikipedia) {
        const searchedTitle =
          await searchWikipediaTitle(
            candidate.name,
          );

        if (searchedTitle) {
          wikipedia =
            await getWikipediaSummary(
              searchedTitle,
            );
        }
      }

      const description =
        candidate.tags.description?.trim() ||
        candidate.tags["description:en"]?.trim() ||
        "";

      if (!wikipedia && description.length < 60) {
        return null;
      }

      const history =
        wikipedia?.extract ??
        description;

      return {
        id: `${candidate.element.type}-${candidate.element.id}`,
        name: candidate.name,
        category:
          candidate.tags.historic ??
          candidate.tags.tourism ??
          candidate.tags.man_made ??
          "historical site",
        lat: candidate.point.lat,
        lon: candidate.point.lon,
        distanceFromRouteM: Math.round(
          candidate.routeDistance,
        ),
        history,
        source:
          wikipedia?.title
            ? "Wikipedia"
            : "OpenStreetMap",
        sourceUrl:
          wikipedia?.url ??
          `https://www.openstreetmap.org/${candidate.element.type}/${candidate.element.id}`,
        imageUrl: wikipedia?.thumbnail ?? null,
        period:
          candidate.tags.start_date ??
          candidate.tags["start_date:en"] ??
          null,
      };
    }),
  );

  return hydrated
    .filter(
      (
        item,
      ): item is NonNullable<typeof item> =>
        Boolean(item),
    )
    .sort(
      (a, b) =>
        a.distanceFromRouteM -
        b.distanceFromRouteM,
    )
    .slice(0, 6);
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const end = body?.end as Coordinate | undefined;

    if (!validCoordinate(end)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "A valid live destination is required.",
        },
        { status: 400 },
      );
    }

    const routeUrl =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${START.lon},${START.lat};${end.lon},${end.lat}` +
      `?overview=full&geometries=geojson&steps=false`;

    const osrm = await fetchJson<{
      code?: string;
      routes?: Array<{
        distance: number;
        duration: number;
        geometry?: {
          type: "LineString";
          coordinates: number[][];
        };
      }>;
    }>(routeUrl);

    if (
      osrm.code !== "Ok" ||
      !osrm.routes?.[0]?.geometry?.coordinates?.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No drivable route could be reconstructed between Pari Chowk and your location.",
        },
        { status: 422 },
      );
    }

    const route = osrm.routes[0];

    const routeCoordinates =
      route.geometry.coordinates
        .map((coordinate) => ({
          lon: coordinate[0],
          lat: coordinate[1],
        }))
        .filter(
          (point) =>
            Number.isFinite(point.lat) &&
            Number.isFinite(point.lon),
        );

    const destination = await reverseGeocode(
      end,
    );

    const historicalPlaces =
      await findHistoricalPlaces(
        routeCoordinates,
      );

    const contextCity =
      destination.city ?? "Greater Noida";

    let routeContext: WikipediaSummary | null =
      null;

    const contextTitle =
      await searchWikipediaTitle(contextCity);

    if (contextTitle) {
      routeContext =
        await getWikipediaSummary(
          contextTitle,
        );
    }

    return NextResponse.json({
      success: true,
      data: {
        origin: {
          ...START,
          name: "Pari Chowk",
          area: "Greater Noida",
        },
        destination: {
          lat: end.lat,
          lon: end.lon,
          name: destination.name,
          displayName: destination.displayName,
          city: destination.city,
        },
        route: {
          distanceKm:
            Math.round(
              (route.distance / 1000) * 10,
            ) / 10,
          durationMin:
            Math.max(
              1,
              Math.round(route.duration / 60),
            ),
          coordinates: routeCoordinates,
        },
        discoveries: historicalPlaces,
        routeContext: routeContext
          ? {
              title: routeContext.title,
              history: routeContext.extract,
              source: "Wikipedia",
              sourceUrl: routeContext.url,
              imageUrl:
                routeContext.thumbnail ?? null,
            }
          : null,
      },
    });
  } catch (error) {
    console.error(
      "Route Explorer failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Route reconstruction failed.",
      },
      { status: 500 },
    );
  }
}
EOF

cat > components/route-explorer/RouteExplorer.tsx <<'EOF'
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

const PARI_CHOWK: Coordinate = {
  lat: 28.4653,
  lon: 77.5117,
};

function formatDistance(meters: number) {
  if (meters < 1000) {
    return `${meters} m from route`;
  }

  return `${(meters / 1000).toFixed(1)} km from route`;
}

function clampText(
  text: string,
  length = 240,
) {
  if (text.length <= length) return text;
  return `${text.slice(0, length).trim()}…`;
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

    setAnalysisStage(0);

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
  }

  async function speak(text: string) {
    if (!soundOn || !text.trim()) return;

    stopVoice();

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
            text: text.trim(),
          }),
        },
      );

      if (!response.ok) return;

      const blob =
        await response.blob();

      const url =
        URL.createObjectURL(blob);

      voiceUrlRef.current = url;

      const audio =
        new Audio(url);

      audio.volume = 0.95;
      voiceRef.current = audio;

      audio.onended = () => {
        if (voiceUrlRef.current === url) {
          URL.revokeObjectURL(url);
          voiceUrlRef.current = null;
        }
      };

      await audio.play();
    } catch {
      // Narration is an enhancement; it should
      // never break route exploration.
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
          "Live location locked. The journey begins at Pari Chowk, Greater Noida. Your destination has been located. Reveal the route to discover what history lies between these two points.",
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
              start: PARI_CHOWK,
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

      const firstThree =
        payload.data.discoveries
          .slice(0, 3)
          .map(
            (place, index) =>
              `Discovery ${index + 1}: ${place.name}. ${clampText(
                place.history,
                150,
              )}`,
          )
          .join(" ");

      const destination =
        payload.data.destination.name;

      void speak(
        `Journey decoded. You travelled ${payload.data.route.distanceKm} kilometres from Pari Chowk to ${destination}. The route takes about ${payload.data.route.durationMin} minutes. ${
          payload.data.discoveries.length
        } verified historical discoveries were found along the route. ${
          firstThree ||
          "No verified historical site was found on this route segment."
        }`,
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
    void speak(
      `${discovery.name}. ${
        discovery.category
      }. ${discovery.history}`,
    );
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
              Start at Pari Chowk. Reality
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
                    PARI CHOWK
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
                    PARI CHOWK
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
                RU
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
                    Pari Chowk →{" "}
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

              <div className="rx2-map-shell">
                <div className="rx2-map-topline">
                  <span>
                    ROUTE / A → B
                  </span>
                  <span>
                    PARI CHOWK
                    <i />
                    {destinationLabel}
                  </span>
                </div>

                <div className="rx2-map">
                  <div className="rx2-map-grid" />

                  <svg
                    viewBox="0 0 1000 520"
                    preserveAspectRatio="none"
                    aria-label="Journey route map"
                  >
                    <path
                      d={routePath}
                      className="rx2-route-glow"
                    />
                    <path
                      d={routePath}
                      className="rx2-route-path"
                    />

                    {result.discoveries.map(
                      (
                        discovery,
                        index,
                      ) => {
                        const position =
                          project({
                            lat: discovery.lat,
                            lon: discovery.lon,
                          });

                        const active =
                          selectedId ===
                          discovery.id;

                        return (
                          <g
                            key={
                              discovery.id
                            }
                            className={
                              active
                                ? "rx2-map-node active"
                                : "rx2-map-node"
                            }
                            onClick={() => {
                              setSelectedId(
                                discovery.id,
                              );
                              void speakDiscovery(
                                discovery,
                              );
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <circle
                              cx={position.x}
                              cy={position.y}
                              r={
                                active
                                  ? 10
                                  : 6
                              }
                            />
                            <text
                              x={
                                position.x +
                                13
                              }
                              y={
                                position.y -
                                12
                              }
                            >
                              {String(
                                index + 1,
                              ).padStart(
                                2,
                                "0",
                              )}
                            </text>
                          </g>
                        );
                      },
                    )}
                  </svg>

                  <div className="rx2-map-node-label rx2-map-start">
                    <span>A</span>
                    <strong>
                      PARI CHOWK
                    </strong>
                  </div>

                  <div className="rx2-map-node-label rx2-map-end">
                    <span>B</span>
                    <strong>
                      YOU
                    </strong>
                  </div>

                  <a
                    className="rx2-map-attribution"
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
                      onClick={() =>
                        speak(
                          `Historical discoveries along your route. ${result.discoveries
                            .map(
                              (
                                discovery,
                                index,
                              ) =>
                                `Discovery ${
                                  index + 1
                                }, ${
                                  discovery.name
                                }. ${clampText(
                                  discovery.history,
                                  130,
                                )}`,
                            )
                            .join(" ")}`,
                        )
                      }
                    >
                      ◉ LISTEN
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

                        {selectedDiscovery.imageUrl && (
                          <img
                            src={
                              selectedDiscovery.imageUrl
                            }
                            alt=""
                            className="rx2-history-image"
                          />
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
EOF

cat >> app/globals.css <<'EOF'

/* ============================================================
   REALITY UNKNOWN — ROUTE EXPLORER V2
   ============================================================ */

.rx2-page {
  --rx-gold: #d7b86a;
  --rx-gold-bright: #f3d78d;
  --rx-ink: #050a12;
  --rx-panel: rgba(7, 13, 23, 0.82);
  --rx-line: rgba(214, 185, 111, 0.2);
  --rx-text: #eee7d8;
  --rx-muted: rgba(225, 218, 201, 0.58);
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #02060d;
  color: var(--rx-text);
  isolation: isolate;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.rx2-bg {
  position: fixed;
  inset: 0;
  z-index: -5;
  background:
    linear-gradient(180deg, rgba(2, 7, 14, 0.7), rgba(2, 6, 13, 0.96)),
    url("/assets/backgrounds/hub-bg.png") center / cover no-repeat;
  transform: scale(1.04);
  filter: saturate(0.72) contrast(1.08);
}

.rx2-vignette {
  position: fixed;
  inset: 0;
  z-index: -4;
  background:
    radial-gradient(circle at 50% 18%, rgba(64, 91, 129, 0.16), transparent 36%),
    radial-gradient(circle at 50% 100%, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.92) 82%);
  pointer-events: none;
}

.rx2-noise {
  position: fixed;
  inset: 0;
  z-index: -3;
  opacity: 0.12;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
  background-size: 42px 42px;
  mask-image: radial-gradient(circle at center, black, transparent 86%);
}

.rx2-header {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 88px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 42px;
  border-bottom: 1px solid rgba(220, 195, 132, 0.1);
  background: rgba(2, 7, 14, 0.72);
  backdrop-filter: blur(20px);
}

.rx2-brand {
  display: inline-flex;
  align-items: center;
  width: fit-content;
}

.rx2-brand img {
  width: 104px;
  height: auto;
  display: block;
  filter: drop-shadow(0 0 16px rgba(216, 186, 103, 0.14));
}

.rx2-status {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 9px;
  letter-spacing: 0.34em;
  color: rgba(229, 218, 195, 0.55);
  white-space: nowrap;
}

.rx2-status b {
  color: var(--rx-gold);
  font-weight: 600;
}

.rx2-status-dot,
.rx2-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: var(--rx-gold-bright);
  box-shadow: 0 0 16px rgba(243, 215, 141, 0.8);
}

.rx2-header-actions {
  justify-self: end;
  display: flex;
  align-items: center;
  gap: 24px;
}

.rx2-sound,
.rx2-exit {
  border: 0;
  background: none;
  color: rgba(232, 225, 211, 0.48);
  font-size: 9px;
  letter-spacing: 0.24em;
  cursor: pointer;
  text-decoration: none;
}

.rx2-sound:hover,
.rx2-exit:hover {
  color: var(--rx-gold-bright);
}

.rx2-launch,
.rx2-ready,
.rx2-state {
  width: min(1180px, calc(100% - 56px));
  margin: 0 auto;
}

.rx2-launch {
  min-height: calc(100vh - 88px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 72px 0 110px;
}

.rx2-kicker {
  color: var(--rx-gold);
  font-size: 9px;
  line-height: 1.4;
  letter-spacing: 0.46em;
  text-transform: uppercase;
}

.rx2-launch h1,
.rx2-state h2,
.rx2-ready h2,
.rx2-results-hero h2,
.rx2-final h3 {
  font-family: Georgia, "Times New Roman", serif;
  font-weight: 400;
  letter-spacing: -0.055em;
}

.rx2-launch h1 {
  max-width: 980px;
  margin: 26px 0 18px;
  font-size: clamp(72px, 9vw, 138px);
  line-height: 0.84;
  color: #f3ecdf;
}

.rx2-launch h1 em,
.rx2-state h2 em,
.rx2-ready h2 em,
.rx2-results-hero h2 em,
.rx2-final h3 em {
  display: block;
  color: rgba(205, 198, 187, 0.46);
  font-style: italic;
  transform: translateX(0.18em);
}

.rx2-lead {
  max-width: 620px;
  margin: 0 auto;
  color: var(--rx-muted);
  font-size: 14px;
  line-height: 1.85;
}

.rx2-route-brief {
  width: min(850px, 100%);
  margin: 54px 0 30px;
  display: grid;
  grid-template-columns: 1fr 180px 1fr;
  align-items: center;
  border-top: 1px solid var(--rx-line);
  border-bottom: 1px solid var(--rx-line);
  padding: 30px 0;
}

.rx2-point {
  display: flex;
  align-items: center;
  gap: 18px;
  text-align: left;
}

.rx2-point:last-child {
  justify-content: flex-end;
  text-align: right;
}

.rx2-point-letter {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 1px solid var(--rx-line);
  color: var(--rx-gold);
  font: 600 11px/1 Inter, sans-serif;
}

.rx2-point small,
.rx2-point span,
.rx2-live-location small,
.rx2-live-location span {
  display: block;
}

.rx2-point small,
.rx2-live-location small {
  color: rgba(227, 217, 199, 0.38);
  font-size: 8px;
  letter-spacing: 0.28em;
  margin-bottom: 8px;
}

.rx2-point strong,
.rx2-live-location strong {
  display: block;
  color: #f0e8d8;
  font: 500 18px/1.1 Georgia, serif;
}

.rx2-point div > span,
.rx2-live-location div > span {
  margin-top: 7px;
  color: rgba(227, 217, 199, 0.43);
  font-size: 9px;
  letter-spacing: 0.14em;
}

.rx2-connector {
  display: flex;
  align-items: center;
  gap: 7px;
  justify-content: center;
}

.rx2-connector i {
  display: block;
  width: 26px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--rx-gold), transparent);
  opacity: 0.65;
}

.rx2-connector span {
  position: absolute;
  transform: translateY(20px);
  color: rgba(225, 211, 179, 0.35);
  font-size: 7px;
  letter-spacing: 0.34em;
}

.rx2-primary {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  min-width: 270px;
  gap: 40px;
  padding: 17px 20px 17px 24px;
  border: 1px solid rgba(234, 206, 135, 0.5);
  background: linear-gradient(180deg, rgba(213, 179, 93, 0.13), rgba(213, 179, 93, 0.04));
  color: #f4ead8;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.26em;
  cursor: pointer;
  transition: 0.25s ease;
}

.rx2-primary b {
  color: var(--rx-gold-bright);
  font-size: 18px;
  font-weight: 400;
}

.rx2-primary:hover {
  transform: translateY(-2px);
  border-color: rgba(243, 215, 141, 0.9);
  background: rgba(243, 215, 141, 0.14);
  box-shadow: 0 16px 48px rgba(0,0,0,0.28), 0 0 40px rgba(216, 185, 104, 0.08);
}

.rx2-trust {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  color: rgba(229, 218, 197, 0.3);
  font-size: 7px;
  letter-spacing: 0.18em;
}

.rx2-trust i {
  width: 28px;
  height: 1px;
  background: rgba(221, 193, 122, 0.25);
}

.rx2-state {
  min-height: calc(100vh - 88px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 70px 0;
}

.rx2-state h2,
.rx2-ready h2 {
  margin: 24px 0 20px;
  font-size: clamp(60px, 7vw, 104px);
  line-height: 0.87;
  color: #f1eadc;
}

.rx2-state p,
.rx2-ready p {
  max-width: 560px;
  margin: 0 auto;
  color: var(--rx-muted);
  font-size: 14px;
  line-height: 1.8;
}

.rx2-radar,
.rx2-analysis-orbit {
  position: relative;
  width: 190px;
  height: 190px;
  margin-bottom: 50px;
  display: grid;
  place-items: center;
}

.rx2-radar::before,
.rx2-radar::after,
.rx2-analysis-orbit::before {
  content: "";
  position: absolute;
  border: 1px solid rgba(215, 184, 106, 0.25);
  border-radius: 50%;
  inset: 18px;
}

.rx2-radar::after {
  inset: 48px;
  border-color: rgba(215, 184, 106, 0.48);
}

.rx2-radar span {
  position: absolute;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(239, 209, 131, 0.7), transparent);
  transform-origin: center;
  animation: rx2Radar 2.4s linear infinite;
}

.rx2-radar span:nth-child(2) {
  transform: rotate(90deg);
  opacity: 0.45;
}

.rx2-radar span:nth-child(3) {
  transform: rotate(45deg);
  opacity: 0.25;
}

.rx2-radar b {
  font-size: 8px;
  letter-spacing: 0.38em;
  color: var(--rx-gold);
  transform: translateX(0.2em);
}

@keyframes rx2Radar {
  to { transform: rotate(360deg); }
}

.rx2-analysis-orbit::before {
  inset: 0;
  animation: rx2Spin 9s linear infinite;
}

.rx2-analysis-orbit > i {
  position: absolute;
  inset: 24px;
  border: 1px solid rgba(215,184,106,0.18);
  border-radius: 50%;
  animation: rx2Pulse 2.2s ease-in-out infinite;
}

.rx2-analysis-orbit > i:nth-child(3) {
  inset: 46px;
  animation-delay: 0.4s;
}

.rx2-analysis-orbit > i:nth-child(4) {
  inset: 68px;
  animation-delay: 0.8s;
}

.rx2-analysis-core {
  position: relative;
  z-index: 2;
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(239, 209, 131, 0.5);
  border-radius: 50%;
  background: rgba(6, 12, 20, 0.82);
  color: var(--rx-gold-bright);
  font: 500 13px/1 Georgia, serif;
  letter-spacing: 0.18em;
}

@keyframes rx2Spin {
  to { transform: rotate(360deg); }
}

@keyframes rx2Pulse {
  50% { transform: scale(1.05); opacity: 0.55; }
}

.rx2-analysis-steps {
  width: min(720px, 100%);
  margin-top: 50px;
  display: grid;
  gap: 9px;
}

.rx2-analysis-steps > div {
  display: grid;
  grid-template-columns: 38px 1fr 14px;
  align-items: center;
  gap: 14px;
  padding: 13px 15px;
  border: 1px solid rgba(220, 195, 132, 0.07);
  color: rgba(231, 222, 205, 0.24);
  text-align: left;
  transition: 0.3s ease;
}

.rx2-analysis-steps > div.active {
  color: #eee6d7;
  border-color: rgba(220, 195, 132, 0.2);
  background: rgba(220, 195, 132, 0.035);
}

.rx2-analysis-steps span {
  color: var(--rx-gold);
  font-size: 8px;
  letter-spacing: 0.16em;
}

.rx2-analysis-steps strong {
  font-size: 9px;
  letter-spacing: 0.22em;
  font-weight: 600;
}

.rx2-analysis-steps i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  border: 1px solid currentColor;
}

.rx2-analysis-steps > div.active i {
  background: var(--rx-gold);
  box-shadow: 0 0 14px rgba(243, 215, 141, 0.55);
}

.rx2-ready {
  min-height: calc(100vh - 88px);
  padding: 130px 0 100px;
}

.rx2-ready-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 70px;
  align-items: end;
  margin-top: 30px;
  padding-bottom: 54px;
  border-bottom: 1px solid rgba(220, 195, 132, 0.12);
}

.rx2-live-location {
  display: flex;
  align-items: center;
  gap: 15px;
  width: fit-content;
  margin-top: 42px;
  padding: 18px 20px;
  border: 1px solid rgba(220, 195, 132, 0.18);
  background: rgba(7, 13, 22, 0.6);
}

.rx2-live-dot {
  display: block;
  flex: 0 0 auto;
}

.rx2-journey-preview {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 12px 18px;
  padding: 28px;
  border: 1px solid rgba(220, 195, 132, 0.13);
  background:
    radial-gradient(circle at 50% 0%, rgba(214, 184, 106, 0.08), transparent 50%),
    rgba(5, 11, 19, 0.62);
}

.rx2-journey-preview span {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 1px solid rgba(220, 195, 132, 0.34);
  color: var(--rx-gold);
  font-size: 9px;
}

.rx2-journey-preview strong {
  color: #eee6d7;
  font: 500 19px Georgia, serif;
}

.rx2-journey-preview i {
  width: 1px;
  height: 48px;
  margin-left: 15px;
  background: linear-gradient(180deg, var(--rx-gold), transparent);
}

.rx2-primary-wide {
  width: 100%;
  margin-top: 28px;
}

.rx2-error-mark {
  display: grid;
  place-items: center;
  width: 72px;
  height: 72px;
  margin-bottom: 42px;
  border: 1px solid rgba(218, 104, 104, 0.45);
  color: #e3a6a6;
  font: 400 28px Georgia, serif;
}

.rx2-error-actions {
  display: flex;
  gap: 12px;
  margin-top: 34px;
}

.rx2-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 20px;
  border: 1px solid rgba(230, 221, 205, 0.14);
  color: rgba(238, 231, 218, 0.65);
  font-size: 9px;
  letter-spacing: 0.22em;
  text-decoration: none;
}

.rx2-secondary:hover {
  border-color: rgba(230, 221, 205, 0.32);
  color: #fff;
}

.rx2-results {
  width: min(1180px, calc(100% - 56px));
  margin: 0 auto;
  padding: 96px 0 90px;
}

.rx2-results-hero {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 60px;
  align-items: end;
  padding-bottom: 44px;
  border-bottom: 1px solid rgba(220, 195, 132, 0.14);
}

.rx2-results-hero h2 {
  margin: 20px 0 14px;
  font-size: clamp(66px, 7vw, 110px);
  line-height: 0.84;
  color: #f2ebde;
}

.rx2-results-hero p {
  color: rgba(229, 218, 198, 0.48);
  font-size: 12px;
  letter-spacing: 0.12em;
}

.rx2-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(110px, 1fr));
  gap: 1px;
  border-left: 1px solid rgba(220, 195, 132, 0.12);
}

.rx2-stats > div {
  min-width: 130px;
  padding: 0 24px;
  border-right: 1px solid rgba(220, 195, 132, 0.12);
}

.rx2-stats small {
  display: block;
  color: rgba(229, 218, 198, 0.32);
  font-size: 7px;
  letter-spacing: 0.28em;
  margin-bottom: 12px;
}

.rx2-stats strong {
  color: #efe6d6;
  font: 400 30px Georgia, serif;
}

.rx2-stats strong span {
  color: rgba(239, 230, 214, 0.4);
  font-size: 12px;
}

.rx2-map-shell {
  margin-top: 44px;
  border: 1px solid rgba(220, 195, 132, 0.15);
  background: rgba(3, 9, 16, 0.72);
  box-shadow: 0 30px 80px rgba(0,0,0,0.3);
}

.rx2-map-topline {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 15px 18px;
  border-bottom: 1px solid rgba(220, 195, 132, 0.1);
  color: rgba(229, 218, 198, 0.35);
  font-size: 7px;
  letter-spacing: 0.24em;
}

.rx2-map-topline span:last-child {
  color: rgba(238, 228, 208, 0.64);
}

.rx2-map-topline i {
  display: inline-block;
  width: 18px;
  height: 1px;
  margin: 0 10px;
  vertical-align: middle;
  background: var(--rx-gold);
}

.rx2-map {
  position: relative;
  min-height: 520px;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 40%, rgba(51, 79, 104, 0.15), transparent 46%),
    linear-gradient(180deg, rgba(7, 17, 28, 0.8), rgba(3, 9, 16, 0.98));
}

.rx2-map-grid {
  position: absolute;
  inset: 0;
  opacity: 0.42;
  background-image:
    linear-gradient(rgba(116, 146, 172, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(116, 146, 172, 0.08) 1px, transparent 1px);
  background-size: 52px 52px;
  transform: perspective(700px) rotateX(58deg) scale(1.35);
  transform-origin: center bottom;
}

.rx2-map svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.rx2-route-glow {
  fill: none;
  stroke: rgba(242, 207, 119, 0.2);
  stroke-width: 13;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: blur(4px);
}

.rx2-route-path {
  fill: none;
  stroke: var(--rx-gold-bright);
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 9 7;
  animation: rx2RouteMove 3s linear infinite;
}

@keyframes rx2RouteMove {
  to { stroke-dashoffset: -64; }
}

.rx2-map-node {
  cursor: pointer;
}

.rx2-map-node circle {
  fill: #07101b;
  stroke: rgba(242, 215, 141, 0.72);
  stroke-width: 2;
  transition: 0.2s ease;
}

.rx2-map-node.active circle {
  fill: var(--rx-gold-bright);
  stroke: #fff1ca;
  filter: drop-shadow(0 0 10px rgba(242, 215, 141, 0.75));
}

.rx2-map-node text {
  fill: rgba(239, 225, 196, 0.48);
  font: 600 8px Inter, sans-serif;
  letter-spacing: 0.12em;
}

.rx2-map-node-label {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 9px;
  color: rgba(238, 229, 210, 0.72);
  font-size: 8px;
  letter-spacing: 0.2em;
}

.rx2-map-node-label span {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(242, 215, 141, 0.45);
  background: rgba(4, 10, 17, 0.82);
  color: var(--rx-gold);
}

.rx2-map-node-label strong {
  font-weight: 600;
}

.rx2-map-start {
  left: 4%;
  top: 10%;
}

.rx2-map-end {
  right: 4%;
  bottom: 12%;
}

.rx2-map-attribution {
  position: absolute;
  right: 12px;
  bottom: 10px;
  color: rgba(225, 216, 199, 0.26);
  font-size: 7px;
  letter-spacing: 0.08em;
  text-decoration: none;
}

.rx2-route-dossier {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 38px;
  margin-top: 60px;
}

.rx2-section-head {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(220, 195, 132, 0.13);
}

.rx2-section-head span {
  color: var(--rx-gold);
  font-size: 8px;
  letter-spacing: 0.34em;
}

.rx2-section-head h3 {
  margin: 13px 0 0;
  font: 400 clamp(38px, 4vw, 58px)/0.9 Georgia, serif;
  color: #eee6d8;
  letter-spacing: -0.045em;
}

.rx2-section-head h3 em {
  color: rgba(238, 230, 216, 0.4);
  font-style: italic;
}

.rx2-listen {
  border: 1px solid rgba(220, 195, 132, 0.18);
  background: rgba(220, 195, 132, 0.03);
  color: rgba(240, 229, 209, 0.58);
  padding: 10px 13px;
  font-size: 8px;
  letter-spacing: 0.18em;
  cursor: pointer;
}

.rx2-listen:hover {
  color: var(--rx-gold-bright);
  border-color: rgba(220, 195, 132, 0.38);
}

.rx2-discovery-list {
  border-top: 0;
}

.rx2-discovery {
  width: 100%;
  display: grid;
  grid-template-columns: 55px 1fr 30px;
  align-items: center;
  gap: 12px;
  padding: 23px 10px;
  border: 0;
  border-bottom: 1px solid rgba(220, 195, 132, 0.1);
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: 0.24s ease;
}

.rx2-discovery:hover,
.rx2-discovery.active {
  background: linear-gradient(90deg, rgba(220, 195, 132, 0.07), transparent);
}

.rx2-discovery-index {
  color: rgba(225, 216, 199, 0.23);
  font: 400 17px Georgia, serif;
}

.rx2-discovery-copy small {
  display: block;
  margin-bottom: 7px;
  color: var(--rx-gold);
  font-size: 7px;
  letter-spacing: 0.28em;
}

.rx2-discovery-copy strong {
  display: block;
  color: #eee6d8;
  font: 400 25px/1.05 Georgia, serif;
}

.rx2-discovery-copy > span {
  display: block;
  margin-top: 8px;
  color: rgba(225, 216, 199, 0.3);
  font-size: 8px;
  letter-spacing: 0.1em;
}

.rx2-discovery-arrow {
  color: rgba(242, 215, 141, 0.55);
  font-size: 15px;
}

.rx2-dossier-side {
  min-width: 0;
}

.rx2-history-card,
.rx2-context-card,
.rx2-empty-history {
  border: 1px solid rgba(220, 195, 132, 0.15);
  background:
    radial-gradient(circle at 100% 0%, rgba(220, 195, 132, 0.07), transparent 45%),
    rgba(6, 12, 21, 0.78);
  padding: 26px;
}

.rx2-history-card {
  position: sticky;
  top: 116px;
}

.rx2-history-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  margin-bottom: 20px;
}

.rx2-history-card-top span,
.rx2-context-card > span {
  color: var(--rx-gold);
  font-size: 7px;
  letter-spacing: 0.3em;
}

.rx2-history-card-top button {
  width: 30px;
  height: 30px;
  border: 1px solid rgba(220, 195, 132, 0.17);
  background: transparent;
  color: rgba(238, 230, 216, 0.64);
  cursor: pointer;
}

.rx2-history-image {
  width: 100%;
  max-height: 180px;
  object-fit: cover;
  margin: 0 0 22px;
  filter: saturate(0.7) contrast(1.05);
}

.rx2-history-card h4,
.rx2-context-card h4 {
  margin: 0;
  color: #f0e8da;
  font: 400 33px/0.98 Georgia, serif;
  letter-spacing: -0.04em;
}

.rx2-history-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 17px 0;
}

.rx2-history-meta span {
  padding: 6px 8px;
  border: 1px solid rgba(220, 195, 132, 0.13);
  color: rgba(229, 218, 198, 0.4);
  font-size: 7px;
  letter-spacing: 0.12em;
}

.rx2-history-card p,
.rx2-context-card p {
  color: rgba(228, 220, 205, 0.62);
  font-size: 12px;
  line-height: 1.85;
}

.rx2-history-source {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 26px;
  padding-top: 16px;
  border-top: 1px solid rgba(220, 195, 132, 0.11);
}

.rx2-history-source span {
  color: rgba(225, 216, 199, 0.27);
  font-size: 7px;
  letter-spacing: 0.2em;
}

.rx2-history-source a {
  color: var(--rx-gold);
  font-size: 8px;
  letter-spacing: 0.12em;
  text-decoration: none;
}

.rx2-context-card {
  padding: 34px;
}

.rx2-context-card h4 {
  margin-top: 17px;
}

.rx2-empty-history {
  margin-top: 20px;
  padding: 42px;
}

.rx2-empty-history span {
  display: block;
  color: var(--rx-gold);
  font-size: 8px;
  letter-spacing: 0.3em;
}

.rx2-empty-history strong {
  display: block;
  margin-top: 17px;
  color: #eee6d8;
  font: 400 27px/1.05 Georgia, serif;
}

.rx2-empty-history p {
  max-width: 580px;
  margin: 15px 0 0;
  color: rgba(228, 220, 205, 0.44);
  font-size: 12px;
  line-height: 1.7;
}

.rx2-context-strip {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 26px;
  margin-top: 90px;
  padding: 38px;
  border-top: 1px solid rgba(220, 195, 132, 0.15);
  border-bottom: 1px solid rgba(220, 195, 132, 0.15);
  background: rgba(220, 195, 132, 0.025);
}

.rx2-context-number {
  color: rgba(225, 216, 199, 0.2);
  font: 400 24px Georgia, serif;
}

.rx2-context-strip span {
  color: var(--rx-gold);
  font-size: 8px;
  letter-spacing: 0.28em;
}

.rx2-context-strip h3 {
  margin: 12px 0;
  color: #eee6d8;
  font: 400 42px/0.95 Georgia, serif;
  letter-spacing: -0.04em;
}

.rx2-context-strip p {
  max-width: 760px;
  color: rgba(228, 220, 205, 0.56);
  font-size: 12px;
  line-height: 1.85;
}

.rx2-context-strip a {
  display: inline-block;
  margin-top: 14px;
  color: var(--rx-gold);
  font-size: 8px;
  letter-spacing: 0.18em;
  text-decoration: none;
}

.rx2-final {
  padding: 160px 0 110px;
  text-align: center;
}

.rx2-final > span {
  color: rgba(225, 216, 199, 0.26);
  font-size: 8px;
  letter-spacing: 0.46em;
}

.rx2-final h3 {
  margin: 25px auto 15px;
  max-width: 850px;
  color: #f1eadc;
  font-size: clamp(58px, 7vw, 108px);
  line-height: 0.82;
}

.rx2-final p {
  color: rgba(228, 220, 205, 0.42);
  font-size: 11px;
  letter-spacing: 0.18em;
}

.rx2-final-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 34px;
}

.rx2-footer {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding-top: 22px;
  border-top: 1px solid rgba(220, 195, 132, 0.1);
  color: rgba(225, 216, 199, 0.2);
  font-size: 7px;
  letter-spacing: 0.13em;
}

@media (max-width: 900px) {
  .rx2-header {
    height: 72px;
    padding: 0 18px;
    grid-template-columns: 1fr auto;
  }

  .rx2-brand img {
    width: 88px;
  }

  .rx2-status {
    display: none;
  }

  .rx2-header-actions {
    gap: 14px;
  }

  .rx2-launch,
  .rx2-ready,
  .rx2-state,
  .rx2-results {
    width: min(100% - 34px, 720px);
  }

  .rx2-launch {
    min-height: calc(100vh - 72px);
    padding-top: 52px;
  }

  .rx2-launch h1 {
    font-size: clamp(58px, 17vw, 92px);
  }

  .rx2-route-brief {
    grid-template-columns: 1fr;
    gap: 20px;
    text-align: left;
  }

  .rx2-point,
  .rx2-point:last-child {
    justify-content: flex-start;
    text-align: left;
  }

  .rx2-connector {
    justify-content: flex-start;
    padding-left: 20px;
  }

  .rx2-ready-grid,
  .rx2-results-hero,
  .rx2-route-dossier {
    grid-template-columns: 1fr;
  }

  .rx2-ready {
    padding-top: 82px;
  }

  .rx2-results {
    padding-top: 62px;
  }

  .rx2-stats {
    border-left: 0;
  }

  .rx2-stats > div {
    min-width: 0;
    padding: 0 13px;
  }

  .rx2-map {
    min-height: 390px;
  }

  .rx2-history-card {
    position: static;
  }

  .rx2-context-strip {
    grid-template-columns: 1fr;
    padding: 28px;
  }

  .rx2-context-number {
    display: none;
  }

  .rx2-final-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .rx2-final-actions .rx2-primary,
  .rx2-final-actions .rx2-secondary {
    width: 100%;
  }

  .rx2-footer {
    flex-direction: column;
  }
}

@media (max-width: 560px) {
  .rx2-header {
    padding: 0 13px;
  }

  .rx2-sound {
    display: none;
  }

  .rx2-exit {
    font-size: 8px;
  }

  .rx2-launch h1 {
    font-size: 58px;
  }

  .rx2-state h2,
  .rx2-ready h2 {
    font-size: 58px;
  }

  .rx2-results-hero h2 {
    font-size: 62px;
  }

  .rx2-stats {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .rx2-stats > div {
    padding: 14px 0;
    border-right: 0;
    border-bottom: 1px solid rgba(220, 195, 132, 0.09);
  }

  .rx2-map-topline {
    flex-direction: column;
    gap: 8px;
  }

  .rx2-discovery {
    grid-template-columns: 40px 1fr 20px;
    padding: 20px 3px;
  }

  .rx2-discovery-copy strong {
    font-size: 21px;
  }

  .rx2-history-card,
  .rx2-context-card {
    padding: 21px;
  }
}
EOF

echo
echo "Route Explorer v2 written."
echo "Backups created with timestamp: $STAMP"
echo
echo "Run:"
echo "  npx tsc --noEmit"
echo "  npm run lint"
echo "  npm run dev"
echo
echo "Then open:"
echo "  http://localhost:3000/route-explorer"
