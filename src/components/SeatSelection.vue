<template>
  <div class="seat-container">
    <h2>Seat Selection</h2>
    <div v-if="seats.length > 0">
      <div class="seat-grid">
        <div v-for="seat in seats" :key="seat.id"
             :class="{ seat: true, occupied: seat.occupied, available: !seat.occupied, selected: seat.id === selectedSeat }"
             @click="selectSeat(seat)">
          {{ seat.rowNumber }}{{ seat.columnLetter }}
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
      selectedSeat: null
    };
  },
  async created() {
    const flightId = this.$route.params.flightId;
    try {
      const response = await axios.get(`http://localhost:8080/api/seats/${flightId}`);
      this.seats = response.data;
    } catch (error) {
      console.error("Error fetching seats:", error);
    }
  },
  methods: {
    selectSeat(seat) {
      if (!seat.occupied) {
        this.selectedSeat = seat.id;
      }
    },
    confirmSeat() {
      alert(`Seat ${this.selectedSeat} confirmed!`);
    }
  }
};
</script>

<style scoped>
.seat-container {
  text-align: center;
}
.seat-grid {
  display: grid;
  grid-template-columns: repeat(3, 50px);
  gap: 5px;
  justify-content: center;
  margin-top: 20px;
}
.seat {
  width: 50px;
  height: 50px;
  border: 1px solid #333;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.occupied {
  background-color: red;
  pointer-events: none;
}
.available {
  background-color: lightgreen;
}
.selected {
  background-color: blue;
  color: white;
}
</style>
