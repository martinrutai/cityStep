import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function Map() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [modal, setModal] = useState(null); // { type: 'add' | 'remove', latlng, marker }

  const markersRef = useRef([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initTimeout = setTimeout(() => {
      const map = L.map(mapContainerRef.current, { center: [51.505, -0.09], zoom: 13 });
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

              const userMarker = L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup('You are here');

              userMarker.on('click', () => {
                setModal({ type: 'remove', marker: userMarker, latlng: userMarker.getLatLng() });
              });

              markersRef.current.push(userMarker);
            },
            (err) => console.warn('Geolocation error:', err.message),
            { enableHighAccuracy: true }
          );
        }

        // Add marker on right-click
        map.on('contextmenu', function (e) {
          L.DomEvent.preventDefault(e);
          setModal({ type: 'add', latlng: e.latlng });
        });
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

  const handleAddConfirm = () => {
    if (modal?.latlng && mapInstanceRef.current) {
      const newMarker = L.marker(modal.latlng)
        .addTo(mapInstanceRef.current)
        .bindPopup(
          `📍 Custom marker<br>(${modal.latlng.lat.toFixed(5)}, ${modal.latlng.lng.toFixed(5)})`
        );

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
    <div style={{ padding: '20px', backgroundColor: '#f0f3f7', minHeight: '100vh' }}>
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

      {/* Modal Overlay */}
      {modal && (
        <div
          style={{
                    width: '60vw',
                    height: '25vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'fixed',
                    zIndex: 1000,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    top: '10%',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(5px)',
          }}
        >
          <div
            style={{
              borderRadius: '12px',
              padding: '25px 30px',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              textAlign: 'center',
              width: '320px',
            }}
          >
            <p style={{ fontSize: '16px', marginBottom: '20px', lineHeight: 1.5 }}>
              {modal.type === 'add' ? 'Add new marker at:' : 'Remove marker at:'}
              <br />
              <strong>
                {modal.latlng?.lat.toFixed(5)}, {modal.latlng?.lng.toFixed(5)}
              </strong>
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {modal.type === 'add' && (
                <button
                  onClick={handleAddConfirm}
                  style={{
                    flex: 1,
                    background: '#4f46e5',
                    color: 'white',
                    padding: '10px 0',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
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
                    padding: '20px 0',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
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
                    padding: '20px 0',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
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
