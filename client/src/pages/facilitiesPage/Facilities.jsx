import React, { useEffect, useState } from "react";
import facilitiesData from "../facilitiesPage/facilitiesData.json";

export default function Facilities() {
  const [facilities, setFacilities] = useState([]);

  useEffect(() => {
    setFacilities(facilitiesData);
  }, []);

  return (
    <div>
      <section className="cards">
        {facilities.length > 0 ? (
          facilities.map((facility) => (
            <div key={facility.id} className="card">
              <img src={facility.image} alt={facility.name} />
              <h3>{facility.name}</h3>
              <p>{facility.description}</p>
            </div>
          ))
        ) : (
          <p>Načítavam zariadenia...</p>
        )}
      </section>
    </div>
  );
}
