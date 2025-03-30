<template>

  <!--
  Istekohtade kuvamine, kui vabade istekohtade arv on 0-st suurem.
  -->
  <div class="seat-container">
    <div v-if="seats.length > 0" class="seat-content">

      <!--
      Struktuur:
      - istmeruudustik;
      - külgede märgistamine;
      - ridade ja iga rea istmete tsüklid;
      - dünaamilised klassid;
      - eri-atribuudid;
      - istekoha valiku lülitus;
      - istmete sildistamine;
      -->
      <div class="seat-map">
        <div class="plane-layout">
          <span class="side-label left">Left Side</span>
          <span class="side-label right">Right Side</span>
          <div v-for="row in totalRows" :key="row" class="seat-row">
            <div
                v-for="seat in getSeatsForRow(row)"
                :key="seat.id"
                :class="[
                'seat',
                {
                  occupied: seat.occupied,
                  available: !seat.occupied,
                  selected: selectedSeats.includes(seat.id),
                  recommended: recommendedSeats.includes(seat.id),
                  'window-seat-left': seat.windowSeat && seat.columnLetter === 'A',
                  'window-seat-right': seat.windowSeat && seat.columnLetter === 'F',
                  'exit-row': seat.exitRow,
                  'extra-legroom': seat.extraLegroom && !seat.exitRow,
                }
              ]"
                @click="selectSeat(seat)"
            >
              <span class="seat-label">{{ seat.rowNumber }}{{ seat.columnLetter }}</span>
              <span class="seat-price">${{ seat.price.toFixed(2) }}</span>
              <span class="seat-indicators">
                {{ seat.windowSeat ? 'W' : '' }}
                {{ seat.exitRow ? 'E' : '' }}
                {{ seat.extraLegroom && !seat.exitRow ? 'L' : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!--
      Valitavate istekohtade arv / loend / koguhind.
      Kinnitus lubatud, kui vastavd tingimused on täidetud.
      -->
      <div class="selection-summary">
        <h2>Select Your Seats</h2>
        <p>Pick {{ ticketCount }} seat(s)</p>
        <h3>Selected Seats</h3>
        <p v-if="selectedSeats.length === 0">None selected</p>
        <p v-else>{{ selectedSeats.map(getSeatLabel).join(", ") }}</p>
        <div class="total" v-if="selectedSeats.length > 0">
          Total: ${{
            selectedSeats.reduce((sum, id) => sum + Number(seats.find(s => s.id === id).price), 0).toFixed(2)
          }}
        </div>
        <button
            v-if="selectedSeats.length === ticketCount"
            @click="confirmSeats"
            class="confirm-btn"
        >
          Confirm Selection
        </button>

        <!--
        Istekohtade kuvamine värviliste indikaatoritega.
        -->
        <div class="legend">
          <h2>Plane Legend</h2>
          <span class="legend-item"><span class="window-seat-left"></span> Window (W)</span>
          <span class="legend-item"><span class="exit-row"></span> Exit Row (E)</span>
          <span class="legend-item"><span class="extra-legroom"></span> Extra Legroom (L)</span>
          <span class="legend-item"><span class="available"></span> Available</span>
          <span class="legend-item"><span class="occupied"></span> Occupied</span>
          <span class="legend-item"><span class="selected"></span> Selected</span>
          <span class="legend-item"><span class="recommended"></span> Recommended</span>
        </div>
      </div>
    </div>

    <!--
    Veateate kuvamine, kui andmed puuduvad.
    -->
    <div v-else class="no-seats">
      <p>No available seats for this flight.</p>
    </div>
  </div>
</template>

<script>

//Importimine:
//- axios HTTP päringute jaoks;
import axios from "axios";

//Reaktiivsete andmete atribuudid:
//- istekoha, valitud- ja soovitatud istekoha, piletite ja istmete massiivid;
//- algväärtused ja limiidid.
export default {
  data() {
    return {
      seats: [],
      selectedSeats: [],
      recommendedSeats: [],
      ticketCount: 1,
      totalRows: 0,
      seatColumns: [],
    };
  },

  //Piletite hulga kaasamine marsruudi päringul istekohtade valikusse.
  created() {
    this.ticketCount = parseInt(this.$route.query.ticketCount) || 1;
    this.fetchSeats();
  },
  methods: {

    //Kõik lennu istekohad "flightId" alusel.
    //Maksimaalse ridade arv ja sorteeritud kordumatud veerud.
    //Istekohtade soovitamine.
    async fetchSeats() {
      const flightId = this.$route.params.flightId;
      try {
        const response = await axios.get(`http://localhost:8080/api/seats/flight/${flightId}`);
        this.seats = response.data;
        this.totalRows = Math.max(...this.seats.map(seat => seat.rowNumber), 0);
        this.seatColumns = [...new Set(this.seats.map(seat => seat.columnLetter))].sort();
        this.recommendSeats();
      } catch (error) {
        console.error("Error fetching seats:", error);
      }
    },

    //Istekoha lüliti:
    //- hõivatud istekohtade ignoreerimine;
    //- valiku tegemisel istekoha eemaldamine / sidumata piletite arvu kohandamine / soovituse väljalülimine.
    selectSeat(seat) {
      if (seat.occupied) return;

      if (this.selectedSeats.includes(seat.id)) {
        this.selectedSeats = this.selectedSeats.filter(s => s !== seat.id);
      } else if (this.selectedSeats.length < this.ticketCount) {
        this.selectedSeats.push(seat.id);
      }
      if (this.selectedSeats.length > 0) {
        this.recommendedSeats = [];
      } else {
        this.recommendSeats();
      }
    },

    //Märguande kuvamine valitud istekohtade ja koguhinnaga.
    confirmSeats() {
      alert(`Seats ${this.selectedSeats.map(this.getSeatLabel).join(", ")} confirmed! Total: $${this.selectedSeats.reduce((sum, id) => sum + Number(this.seats.find(s => s.id === id).price), 0).toFixed(2)}`);
    },

    //Kindla rea kohtade tagastamine, sorteeritud veerutähe järgi (A-F).
    getSeatsForRow(row) {
      return this.seats.filter(seat => seat.rowNumber === row).sort((a, b) => a.columnLetter.localeCompare(b.columnLetter));
    },

    //Istekoha "id" konverteerimine sildiks ("1A").
    getSeatLabel(seatId) {
      const seat = this.seats.find(s => s.id === seatId);
      return seat ? `${seat.rowNumber}${seat.columnLetter}` : "";
    },

    //Vabade kohtade rühma soovitamine, vastavalt piletite arvule, kui ühtegi istekohta ei ole valitud ja piletite arv on suurem kui 1.
    recommendSeats() {
      this.recommendedSeats = [];
      if (this.ticketCount <= 1 || this.selectedSeats.length > 0) return;
      for (let row = 1; row <= this.totalRows; row++) {
        const rowSeats = this.getSeatsForRow(row).filter(seat => !seat.occupied);
        for (let i = 0; i <= rowSeats.length - this.ticketCount; i++) {
          const group = rowSeats.slice(i, i + this.ticketCount);
          const hasOccupiedBetween = group.some(seat => seat.occupied);
          if (!hasOccupiedBetween) {
            this.recommendedSeats.push(...group.map(seat => seat.id));
          }
        }
      }
    },
  },
};
</script>

<!--
Stiil
-->
<style scoped>
.seat-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.seat-content {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.seat-map {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plane-layout {
  position: relative;
}

.side-label {
  position: absolute;
  top: -20px;
  font-size: 12px;
  color: #666;
}

.side-label.left {
  left: 0;
}

.side-label.right {
  right: 0;
}

.seat-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: nowrap;
}

.seat {
  width: 80px;
  height: 50px;
  border-radius: 4px;
  text-align: center;
  cursor: pointer;
  border: 1px solid #ccc;
  background: white;
  font-size: 14px;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5px;
}

.occupied {
  background: #cccccc;
  cursor: not-allowed;
}

.available {
  background: #28a745;
  color: white;
}

.selected {
  background: #007bff;
  color: white;
}

.recommended {
  background: #ffeb3b;
  color: black;
}

.window-seat-left {
  border-left: 2px solid #007bff;
}

.window-seat-right {
  border-right: 2px solid #007bff;
}

.exit-row {
  border-top: 2px dashed #ff4500;
}

.extra-legroom:not(.exit-row) {
  border-top: 2px dotted #ff4500;
}

.seat-label {
  font-weight: bold;
}

.seat-price {
  font-size: 12px;
}

.seat-indicators {
  font-size: 10px;
  font-weight: bold;
}

.selection-summary {
  flex: 1;
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: left;
}

.selection-summary h2 {
  margin-top: 0;
  font-size: 24px;
}

.selection-summary h3 {
  margin-top: 15px;
  font-size: 18px;
}

.total {
  margin-top: 10px;
  font-weight: bold;
  color: #28a745;
}

.confirm-btn {
  margin-top: 15px;
  padding: 10px;
  width: 100%;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.confirm-btn:hover {
  background: #218838;
}

.legend {
  margin-top: 15px;
  font-size: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.legend-item span {
  width: 12px;
  height: 12px;
  display: inline-block;
  border-radius: 2px;
}

.legend-item .window-seat-left {
  border-left: 2px solid #007bff;
}

.legend-item .exit-row {
  border-top: 2px dashed #ff4500;
}

.legend-item .extra-legroom {
  border-top: 2px dotted #ff4500;
}

.legend-item .available {
  background: #28a745;
}

.legend-item .occupied {
  background: #cccccc;
}

.legend-item .selected {
  background: #007bff;
}

.legend-item .recommended {
  background: #ffeb3b;
}

.no-seats {
  padding: 10px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
}

@media (max-width: 600px) {
  .seat-container {
    max-width: 100%;
    margin: 10px;
    padding: 15px;
  }

  .seat-content {
    flex-direction: column;
    gap: 10px;
  }

  .seat-map {
    flex: none;
  }

  .seat-row {
    flex-wrap: wrap;
    justify-content: flex-start;
  }

  .seat {
    width: 60px;
    height: 40px;
    font-size: 12px;
    padding: 3px;
  }

  .seat-price {
    font-size: 10px;
  }

  .seat-indicators {
    font-size: 8px;
  }

  .selection-summary {
    flex: none;
    padding: 8px;
  }

  .selection-summary h2 {
    font-size: 20px;
  }

  .selection-summary h3 {
    font-size: 16px;
  }

  .confirm-btn {
    padding: 8px;
    font-size: 14px;
  }

  .legend {
    margin-top: 10px;
    font-size: 10px;
    gap: 8px;
  }

  .legend-item span {
    width: 10px;
    height: 10px;
  }
}
</style>
