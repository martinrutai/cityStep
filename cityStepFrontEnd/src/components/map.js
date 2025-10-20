import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import { useUser } from './ContextUser';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const redIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function Map() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [modal, setModal] = useState(null);
  const { user, deductMoney } = useUser();

  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initTimeout = setTimeout(() => {
      const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(
        [51.505, -0.09],
        13
      );
      mapInstanceRef.current = map;

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      map.whenReady(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              if (!mapInstanceRef.current || !mapInstanceRef.current._loaded) return;

              map.setView([latitude, longitude], 15);

              const userMarker = L.marker([latitude, longitude], { icon: redIcon })
                .addTo(map)
                .bindPopup('You are here');
            },
            (err) => console.warn('Geolocation error:', err.message),
            { enableHighAccuracy: true }
          );
        }
      });
    }, 0);

    return () => {
      clearTimeout(initTimeout);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, []);

const handlePlaceMarker = () => {
  if (!mapInstanceRef.current) return;

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLatLng = L.latLng(latitude, longitude);

        const isTooClose = markersRef.current.some((marker) => {
          const existingLatLng = marker.getLatLng();
          const distance = newLatLng.distanceTo(existingLatLng);
          return distance < 20;
        });

        if (isTooClose) {
          alert('You are too close to an existing marker (must be at least 20 meters away).');
          return;
        }

        const newMarker = L.marker(newLatLng)
          .addTo(mapInstanceRef.current)
          .bindPopup('Marker placed here')
          .openPopup();

        deductMoney(100);
        markersRef.current.push(newMarker);

        newMarker.on('click', () =>
          setModal({ type: 'remove', marker: newMarker, latlng: newMarker.getLatLng() })
        );
      },
      (err) => console.warn('Geolocation error:', err.message),
      { enableHighAccuracy: true }
    );
  } else {
    alert('Geolocation not supported in your browser.');
  }
};


  const handleAddConfirm = () => {
    if (modal?.latlng && mapInstanceRef.current) {
      const newMarker = L.marker(modal.latlng).addTo(mapInstanceRef.current);
      deductMoney(100);

      newMarker.on('click', () =>
        setModal({ type: 'remove', marker: newMarker, latlng: newMarker.getLatLng() })
      );

      markersRef.current.push(newMarker);
    }
    setModal(null);
  };

  const handleRemoveConfirm = () => {
    if (modal?.marker && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(modal.marker);
      markersRef.current = markersRef.current.filter((m) => m !== modal.marker);
    }
    setModal(null);
  };

  const handleCancel = () => setModal(null);

  return (
    <div style={{ padding: '20px', backgroundColor: '#353535ff', minHeight: '100vh' }}>
      {}
      <div
        ref={mapContainerRef}
        style={{
          height: '70vh',
          width: '100%',
          borderRadius: '12px',
          boxShadow: '0 6px 18px rgba(0,0,0,0.1)',
          overflow: 'hidden',
        }}
      />

      <div style={{ marginBottom: '10px', textAlign: 'center' }}>
        <button
          onClick={handlePlaceMarker}
          style={{
            padding: '10px 20px',
            marginTop: '15px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 500,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          Place Marker
        </button>
      </div>

      {modal && (
        <div
          style={{
            width: '60vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            zIndex: 1000,
            left: '50%',
            transform: 'translateX(-50%)',
            top: '40%',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(5px)',
          }}
        >
          <div
            style={{
              borderRadius: '12px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              textAlign: 'center',
              width: '320px',
            }}
          >
            <p style={{ fontSize: '16px', marginBottom: '20px', lineHeight: 1.5 }}>
              {modal.type === 'add' ? 'Add new marker here' : 'Remove this marker'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '5%' }}>
              {modal.type === 'add' && (
                <button
                  onClick={handleAddConfirm}
                  style={{
                    flex: 1,
                    background: '#4f46e5',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    height: '6vh',
                    margin: '5%',
                  }}
                >
                  Confirm
                </button>
              )}
              {modal.type === 'remove' && (
                <button
                  onClick={handleRemoveConfirm}
                  style={{
                    flex: 1,
                    background: '#ef4444',
                    color: 'white',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    margin: '5%',
                  }}
                >
                  Delete
                </button>
              )}
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  background: '#e0e0e0',
                  color: '#333',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 500,
                  height: '6vh',
                  margin: '5%',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Map;
