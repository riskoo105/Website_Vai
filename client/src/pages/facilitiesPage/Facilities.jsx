import React from "react";

export default function Facilities() {
  return (
    <div>
      <section class="cards">
        <div class="card">
          <img src="football.jpg" alt="Futbalové ihrisko" />
          <h3> Futbalové ihriská</h3>
          <p>
            Rezervujte si jedno z našich moderných futbalových ihrísk s umelou
            trávou.
          </p>
        </div>
        <div class="card">
          <img src="tennis.jpg" alt="Tenisové kurty" />
          <h3>Tenisové kurty</h3>
          <p>Vychutnajte si tenis na našich kvalitných kurtoch s osvetlením.</p>
        </div>
        <div class="card">
          <img src="basketball.jpg" alt="Basketbalové ihrisko" />
          <h3>Basketbalové ihriská</h3>
          <p>Skvelé basketbalové ihriská pre amatérov aj profesionálov.</p>
        </div>
      </section>
    </div>
  );
}
