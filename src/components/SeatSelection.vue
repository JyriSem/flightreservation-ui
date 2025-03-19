<template>
  <div class="seat-container">
    <h2>Seat Selection</h2>
    <div v-if="seats.length > 0">
      <div class="seat-map">
        <div v-for="row in totalRows" :key="row" class="seat-row">
          <div
              v-for="seat in getSeatsForRow(row)"
              :key="seat.id"
              :class="['seat', { occupied: seat.occupied, available: !seat.occupied, selected: seat.id === selectedSeat }]"
              @click="selectSeat(seat)"
          >
            {{ seat.columnLetter }}
          </div>
        </div>
      </div>
      <button v-if="selectedSeat" @click="confirmSeat">Confirm Selection</button>
    </div>
    <p v-else>No available seats.</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      seats: [],
      selectedSeat: null,
      totalRows: 22,
      seatColumns: ['A', 'B', 'C', 'D', 'E', 'F']
    };
  },
  async created() {
    await this.fetchSeats();
  },
  methods: {
    async fetchSeats() {
      const flightId = this.$route.params.flightId;
      try {
        const response = await axios.get(`http://localhost:8080/api/seats/flight/${flightId}`);
        this.seats = response.data;
      } catch (error) {
        console.error("Error fetching seats:", error);
      }
    },
    selectSeat(seat) {
      if (!seat.occupied) {
        this.selectedSeat = seat.id;
      }
    },
    confirmSeat() {
      alert(`Seat ${this.selectedSeat} confirmed!`);
    },
    getSeatsForRow(row) {
      return this.seats.filter(seat => seat.rowNumber === row);
    }
  }
};
</script>

<style scoped>
.seat-container {
  text-align: center;
}

.seat-map {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.seat-row {
  display: flex;
  justify-content: center;
  gap: 5px;
}

.seat {
  width: 30px;
  height: 30px;
  border-radius: 5px;
  text-align: center;
  line-height: 30px;
  cursor: pointer;
  border: 1px solid black;
}

.occupied {
  background-color: gray;
  cursor: not-allowed;
}

.available {
  background-color: green;
}

.selected {
  background-color: blue;
  color: white;
}
</style>
