import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './map.css';
import { useUser } from './ContextUser';
import ulozky, { getDistanceOnEarth } from './ulozky';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const redIcon = L.icon({
  iconUrl: "/assets/icon.png",
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [55, 48],
  iconAnchor: [30, 55],
  popupAnchor: [-1, -58],
  shadowSize: [72, 57],
  zIndex: 9,
});

function Map() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [modal, setModal] = useState(null);
  const [activeTask, setActiveTask] = useState(null);
  const [activeDistance, setActiveDistance] = useState(null);
  const { user, buildings, addBuilding, removeBuilding, deductMoney, addMoney, setBuildings } = useUser();


useEffect(() => {
  if (!mapContainerRef.current || mapInstanceRef.current) return;

  const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([51.505, -0.09], 13);
  mapInstanceRef.current = map;

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;

        if (!mapInstanceRef.current || !mapInstanceRef.current._loaded) return;

        mapInstanceRef.current.setView([latitude, longitude], 15);

        if (mapInstanceRef.current) {
          L.marker([latitude, longitude], { icon: redIcon, zIndexOffset: -1000, interactive: false })
            .addTo(mapInstanceRef.current)
            .bindPopup('You are here', {
                className: 'custom-popup'
              });
        }
      },
      (err) => console.warn('Geolocation error:', err.message),
      { enableHighAccuracy: true }
    );
  }

  return () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };
}, []);

const handleGetTask = async () => {
  if (buildings.length < 2) {
    alert("You need at least 2 buildings to generate a task!");
    return;
  }

  const tasks = ulozky(buildings);
  console.log("Generated tasks:", tasks);

  setModal({ type: 'tasks', tasks });

  try {
    const res = await fetch('http://localhost:8081/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tasks),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    console.log('Tasks saved to database:', data);
  } catch (err) {
    console.warn('Could not save tasks to backend:', err);
  }
};

const handlePlaceMarker = () => {
  if (!mapInstanceRef.current) return;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      const newLatLng = L.latLng(latitude, longitude);

      const tooClose = buildings.some((b) => newLatLng.distanceTo([b.lat, b.lng]) < 0);
      if (tooClose) {
        alert('Too close to another building (min 20m).');
        return;
      }

      if (user.money < 100) {
        alert('Not enough money to place a building!');
        return;
      }

      deductMoney(100);

      const marker = L.marker(newLatLng)
        .addTo(mapInstanceRef.current)

      const newBuilding = {
        id: Date.now(),
        marker,
        lat: latitude,
        lng: longitude,
        level: 1,
        income: 50,
        upgradeCost: 100,
      };

      marker.on('click', () => setModal({ type: 'manage', building: newBuilding }));

      addBuilding(newBuilding);
    },
    (err) => console.warn('Geolocation error:', err.message),
    { enableHighAccuracy: true }
  );
};

const handleUpgrade = () => {
  const b = modal.building;
  if (user.money < b.upgradeCost) {
    alert('Not enough money to upgrade!');
    return;
  }

  deductMoney(b.upgradeCost);

  const updates = {
    level: b.level + 1,
    income: Math.round(b.income * 1.5),
    upgradeCost: Math.round(b.upgradeCost * 1.6)
  };

  setModal(null);
};

const handleSell = () => {
  const b = modal.building;
  mapInstanceRef.current.removeLayer(b.marker);

  const refund = Math.round(b.upgradeCost * 0.2);
  addMoney(refund);

  removeBuilding(b.id);
  setModal(null);
};

  const handleCancel = () => setModal(null);

  const handleSelectTask = (task) => {
    const goal = buildings.find((b) => b.id == task.goalId);
    if (!mapInstanceRef.current) return;

    if (goal) {
      mapInstanceRef.current.setView([goal.lat, goal.lng], 16);

      if (goal.marker && goal.marker.openPopup) {
        goal.marker.openPopup();
      } else {
        const tmp = L.marker([goal.lat, goal.lng]).addTo(mapInstanceRef.current);
        tmp.bindPopup(task.goalName || `Building ${task.goalId}`).openPopup();
        setTimeout(() => mapInstanceRef.current.removeLayer(tmp), 5000);
      }
    } else {
      alert(`Goal building (id ${task.goalId}) not found locally.`);
    }

    setActiveTask(task);
    setModal(null);
  };

  useEffect(() => {
    if (!activeTask) {
      setActiveDistance(null);
      return;
    }

    if (!navigator.geolocation) {
      alert('Geolocation not available in your browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const goal = buildings.find((b) => b.id == activeTask.goalId);
        if (!goal) {
          setActiveDistance(null);
          return;
        }

        const dist = Math.round(getDistanceOnEarth(latitude, longitude, goal.lat, goal.lng));
        setActiveDistance(dist);

        if (dist <= 30) {
          try {
            navigator.geolocation.clearWatch(watchId);
          } catch (e) {
          }

          addMoney(activeTask.reward);
          alert(`You arrived at ${activeTask.goalName}. Reward: $${activeTask.reward}`);
          setActiveTask(null);
          setActiveDistance(null);
        }
      },
      (err) => console.warn('Geolocation watch error:', err.message),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [activeTask, buildings, addMoney]);

  return (
    <div style={{ padding: '5%', backgroundColor: '#353535ff', minHeight: '100vh' }}>
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
            padding: '1vh 3vw',
            marginTop: '1vh',
            marginRight: '2vw',
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
          Place Building
        </button>

          <button
            onClick={handleGetTask}
            style={{
              padding: '1vh 3vw',
              marginTop: '1vh',
              marginRight: '2vw',
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
            Get Task
          </button>
      </div>

      {modal?.type === 'tasks' && (
        <div
          style={{
            width: '70%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            zIndex: 999,
            left: '50%',
            transform: 'translateX(-50%)',
            top: '30%',
            borderRadius: '8px',
            backdropFilter: 'blur(5px)',
          }}
        >
          <div
            style={{
              borderRadius: '12px',
              color: 'white',
              backgroundColor: '#2b2b2b',
              padding: '4%',
              textAlign: 'center',
              width: '80%',
              maxHeight: '60vh',
              overflow: 'auto',
            }}
          >
            <h3>📝 Generated Tasks</h3>
            {modal.tasks && modal.tasks.length === 0 && <p>No tasks available.</p>}
            {modal.tasks && modal.tasks.length > 0 && (
              <div style={{ textAlign: 'left', marginTop: '12px' }}>
                {modal.tasks.map((t, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#393939',
                      marginBottom: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleSelectTask(t)}>
                      <div style={{ fontWeight: 600 }}>{t.goalName} (to id: {t.goalId})</div>
                      <div style={{ fontSize: '13px', color: '#ddd' }}>{t.distance} m — Reward: ${t.reward}</div>
                      <div style={{ fontSize: '12px', color: '#bbb' }}>From building id: {t.fromId}</div>
                    </div>

                    <div style={{ marginLeft: '12px' }}>
                      <button
                        onClick={() => handleSelectTask(t)}
                        style={{
                          background: '#4f46e5',
                          color: 'white',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '8px 10px',
                        }}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                onClick={() => setModal(null)}
                style={{
                  background: '#4f46e5',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px 16px',
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (modal.tasks && modal.tasks.length > 0) {
                    handleSelectTask(modal.tasks[0]);
                  }
                }}
                style={{
                  background: '#10b981',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px 16px',
                }}
              >
                Accept first
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active task banner */}
      {activeTask && (
        <div
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: '#111827',
            color: 'white',
            padding: '12px 18px',
            borderRadius: '10px',
            boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <div style={{ fontWeight: 600 }}>{activeTask.goalName}</div>
          <div style={{ color: '#d1d5db' }}>{activeDistance ? `${activeDistance} m` : 'Locating...'}</div>
          <div style={{ color: '#10b981', fontWeight: 700 }}>${activeTask.reward}</div>
          <div style={{ marginLeft: '8px' }}>
            <button
              onClick={() => {
                setActiveTask(null);
                setActiveDistance(null);
              }}
              style={{
                background: '#ef4444',
                color: 'white',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 10px',
              }}
            >
              Abandon
            </button>
          </div>
        </div>
      )}

      {modal?.type === 'manage' && (
        <div
          style={{
            width: '70%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            zIndex: 999,
            left: '50%',
            transform: 'translateX(-50%)',
            top: '40%',
            borderRadius: '8px',
            backdropFilter: 'blur(5px)',
          }}
        >
          <div
            style={{
              borderRadius: '12px',
              color: 'white',
              backgroundColor: '#2b2b2b',
              padding: '10%',
              textAlign: 'center',
              width: '80%',
            }}
          >
            <h3>🏠 Building (Level {modal.building.level})</h3>
            <p>Income: ${modal.building.income}</p>
            <p>Upgrade cost: ${modal.building.upgradeCost}</p>

            <div style={{ display: 'inline-flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={handleUpgrade}
                style={{
                  flex: 1,
                  background: '#4f46e5',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
                }}
              >
                Upgrade
              </button>
              <button
                onClick={handleSell}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
                }}
              >
                Sell
              </button>
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  background: '#e0e0e0',
                  color: '#333',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
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

//RUTAI DATABAZU TREBA
/*
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
  iconUrl: '/assets/icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [45, 50],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const API_URL = 'http://localhost:8081';

function Map() {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [modal, setModal] = useState(null);
  const {
    user,
    buildings,
    addBuilding,
    removeBuilding,
    deductMoney,
    addMoney,
    setBuildings,
    setUser,
  } = useUser();

  //
  // 🧠 LOAD USER + BUILDINGS FROM DATABASE
  //
  useEffect(() => {
    async function loadData() {
      try {
        // Assume user with ID = 1
        const userRes = await fetch(`${API_URL}/users/1`);
        const userData = await userRes.json();

        const buildingsRes = await fetch(`${API_URL}/users/1/buildings`);
        const buildingsData = await buildingsRes.json();

        setUser(userData);
        setBuildings(
          buildingsData.map((b) => ({
            ...b,
            marker: null, // marker will be added when map is ready
          }))
        );
      } catch (err) {
        console.error('Error loading data:', err);
      }
    }
    loadData();
  }, [setUser, setBuildings]);

  //
  // 🗺️ INIT MAP
  //
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([51.505, -0.09], 13);
    mapInstanceRef.current = map;

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (!mapInstanceRef.current || !mapInstanceRef.current._loaded) return;
          mapInstanceRef.current.setView([latitude, longitude], 15);
          // player marker behind buildings and non-interactive so it won't block clicks
          L.marker([latitude, longitude], { icon: redIcon, zIndexOffset: -1000, interactive: false })
            .addTo(mapInstanceRef.current)
            .bindPopup('You are here');
        },
        (err) => console.warn('Geolocation error:', err.message),
        { enableHighAccuracy: true }
      );
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  //
  // 📍 Render existing buildings on map
  //
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    buildings.forEach((b) => {
      if (!b.marker) {
        const marker = L.marker([b.lat, b.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(`Building Lv. ${b.level}`);
        marker.on('click', () => setModal({ type: 'manage', building: { ...b, marker } }));

        b.marker = marker;
      }
    });
  }, [buildings]);

  //
  // 💰 Passive income every 5s
  //
  useEffect(() => {
    const incomeInterval = setInterval(() => {
      if (buildings.length > 0) {
        const totalIncome = buildings.reduce((sum, b) => sum + b.income, 0);
        addMoney(totalIncome);

        // 💾 Save user money to DB
        fetch(`${API_URL}/users/1/money`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ money: user.money + totalIncome }),
        });
      }
    }, 5000);

    return () => clearInterval(incomeInterval);
  }, [buildings, addMoney, user.money]);

  //
  // ➕ Place a new building
  //
  const handlePlaceMarker = async () => {
    if (!mapInstanceRef.current) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const newLatLng = L.latLng(latitude, longitude);

        const tooClose = buildings.some((b) => newLatLng.distanceTo([b.lat, b.lng]) < 20);
        if (tooClose) {
          alert('Too close to another building (min 20m).');
          return;
        }

        if (user.money < 100) {
          alert('Not enough money to place a building!');
          return;
        }

        deductMoney(100);

        // 💾 Save building to DB
        const res = await fetch(`${API_URL}/users/1/buildings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lat: latitude,
            lng: longitude,
            level: 1,
            income: 50,
            upgradeCost: 100,
          }),
        });

        const dbBuilding = await res.json();

        const marker = L.marker(newLatLng)
          .addTo(mapInstanceRef.current)
          .bindPopup('New Building')
          .openPopup();

        const newBuilding = {
          ...dbBuilding,
          marker,
        };

        marker.on('click', () => setModal({ type: 'manage', building: newBuilding }));

        addBuilding(newBuilding);
      },
      (err) => console.warn('Geolocation error:', err.message),
      { enableHighAccuracy: true }
    );
  };

  //
  // ⬆️ Upgrade building
  //
  const handleUpgrade = async () => {
    const b = modal.building;
    if (user.money < b.upgradeCost) {
      alert('Not enough money to upgrade!');
      return;
    }

    const updated = {
      ...b,
      level: b.level + 1,
      income: Math.round(b.income * 1.5),
      upgradeCost: Math.round(b.upgradeCost * 1.6),
    };

    deductMoney(b.upgradeCost);
    setBuildings((prev) => prev.map((x) => (x.id === b.id ? updated : x)));

    // 💾 Update DB
    await fetch(`${API_URL}/buildings/${b.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        level: updated.level,
        income: updated.income,
        upgradeCost: updated.upgradeCost,
      }),
    });

    setModal(null);
  };

  //
  // 💸 Sell building (refund 20%)
  //
  const handleSell = async () => {
    const b = modal.building;
    mapInstanceRef.current.removeLayer(b.marker);

    const refund = Math.round(b.upgradeCost * 0.2);
    addMoney(refund);

    removeBuilding(b.id);
    setModal(null);

    // 💾 Remove from DB
    await fetch(`${API_URL}/buildings/${b.id}`, {
      method: 'DELETE',
    });
  };

  const handleCancel = () => setModal(null);

  return (
    <div style={{ padding: '20px', backgroundColor: '#353535ff', minHeight: '100vh' }}>
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
            marginTop: '2vh',
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
          Place Building
        </button>
      </div>

      {modal?.type === 'manage' && (
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
            backdropFilter: 'blur(5px)',
          }}
        >
          <div
            style={{
              borderRadius: '12px',
              background: '#fff',
              padding: '20px',
              textAlign: 'center',
              width: '320px',
            }}
          >
            <h3>🏠 Building (Level {modal.building.level})</h3>
            <p>Income: ${modal.building.income}</p>
            <p>Upgrade cost: ${modal.building.upgradeCost}</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                onClick={handleUpgrade}
                style={{
                  flex: 1,
                  background: '#4f46e5',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
                }}
              >
                Upgrade
              </button>
              <button
                onClick={handleSell}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
                }}
              >
                Sell
              </button>
              <button
                onClick={handleCancel}
                style={{
                  flex: 1,
                  background: '#e0e0e0',
                  color: '#333',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '10px',
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

export default Map;*/