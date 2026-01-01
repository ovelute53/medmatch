"use client";

import React, { useMemo, useState, useEffect } from "react";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import Link from "next/link";

interface Hospital {
  id: number;
  name: string;
  nameEn: string | null;
  address: string;
  city: string | null;
  rating: number | null;
  reviewCount: number;
  imageUrl: string | null;
}

interface HospitalWithCoordinates extends Hospital {
  coordinates?: { lat: number; lng: number };
}

interface GoogleMapViewProps {
  hospitals: Hospital[];
  center?: { lat: number; lng: number };
  zoom?: number;
  language?: "ko" | "en";
}

const libraries: ("places" | "geometry")[] = ["places"];

export default function GoogleMapView({
  hospitals,
  center = { lat: 37.5665, lng: 126.978 }, // 서울시청 기본 위치
  zoom = 13,
  language = "ko",
}: GoogleMapViewProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language,
  });

  const [selectedHospital, setSelectedHospital] = useState<HospitalWithCoordinates | null>(null);
  const [hospitalsWithCoords, setHospitalsWithCoords] = useState<HospitalWithCoordinates[]>([]);

  // 주소를 좌표로 변환 (Geocoding)
  useEffect(() => {
    if (!isLoaded || !window.google) return;

    const geocoder = new window.google.maps.Geocoder();

    const geocodeHospitals = async () => {
      const geocodedHospitals: HospitalWithCoordinates[] = [];

      for (const hospital of hospitals) {
        const fullAddress = hospital.city 
          ? `${hospital.city}, ${hospital.address}` 
          : hospital.address;

        try {
          const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
            geocoder.geocode({ address: fullAddress }, (results, status) => {
              if (status === "OK" && results) {
                resolve(results);
              } else {
                reject(status);
              }
            });
          });

          if (results && results[0]) {
            const location = results[0].geometry.location;
            geocodedHospitals.push({
              ...hospital,
              coordinates: {
                lat: location.lat(),
                lng: location.lng(),
              },
            });
          } else {
            // Geocoding 실패 시 기본 좌표 사용
            geocodedHospitals.push(hospital);
          }
        } catch (error) {
          console.error(`Geocoding failed for ${hospital.name}:`, error);
          geocodedHospitals.push(hospital);
        }
      }

      setHospitalsWithCoords(geocodedHospitals);
    };

    geocodeHospitals();
  }, [hospitals, isLoaded]);

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: true,
      scrollwheel: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    }),
    []
  );

  // 좌표가 있는 병원들의 중심점 계산
  const mapCenter = useMemo(() => {
    const validCoords = hospitalsWithCoords
      .filter((h) => h.coordinates)
      .map((h) => h.coordinates!);

    if (validCoords.length === 0) return center;

    const avgLat = validCoords.reduce((sum, coord) => sum + coord.lat, 0) / validCoords.length;
    const avgLng = validCoords.reduce((sum, coord) => sum + coord.lng, 0) / validCoords.length;

    return { lat: avgLat, lng: avgLng };
  }, [hospitalsWithCoords, center]);

  if (loadError) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <p className="text-gray-600 mb-2">지도를 불러올 수 없습니다.</p>
          <p className="text-sm text-gray-500">Google Maps API 키를 확인해주세요.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">지도를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  const validHospitals = hospitalsWithCoords.filter((h) => h.coordinates);

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
      <GoogleMap
        options={mapOptions}
        zoom={validHospitals.length > 0 ? zoom : 11}
        center={mapCenter}
        mapContainerStyle={{ width: "100%", height: "100%" }}
      >
        {validHospitals.map((hospital) => (
          <Marker
            key={hospital.id}
            position={hospital.coordinates!}
            onClick={() => setSelectedHospital(hospital)}
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new window.google.maps.Size(32, 32),
            }}
          />
        ))}

        {selectedHospital && selectedHospital.coordinates && (
          <InfoWindow
            position={selectedHospital.coordinates}
            onCloseClick={() => setSelectedHospital(null)}
          >
            <div className="p-2 max-w-xs">
              <Link
                href={`/hospitals/${selectedHospital.id}`}
                className="block hover:text-primary-600 transition-colors"
              >
                <h3 className="font-bold text-gray-900 mb-1">
                  {language === "ko" 
                    ? selectedHospital.name 
                    : (selectedHospital.nameEn || selectedHospital.name)}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{selectedHospital.address}</p>
                {selectedHospital.rating !== null && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{selectedHospital.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({selectedHospital.reviewCount})</span>
                  </div>
                )}
                <p className="text-xs text-primary-600 mt-2 font-medium">
                  {language === "ko" ? "상세 정보 보기 →" : "View Details →"}
                </p>
              </Link>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
