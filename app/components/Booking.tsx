export default function Booking() {
  return (
    <section
      style={{
        padding: "100px 20px",
        textAlign: "center",
      }}
    >
      <h2
        style={{
          fontSize: "42px",
          marginBottom: "20px",
        }}
      >
        Booking
      </h2>

      <p
        style={{
          color: "#888",
          marginBottom: "40px",
        }}
      >
        Ready to start your next tattoo?
      </p>

      <button
        style={{
          padding: "16px 40px",
          background: "#ffffff",
          color: "#000",
          border: "none",
          borderRadius: "50px",
          fontSize: "18px",
          cursor: "pointer",
        }}
      >
        Book Appointment
      </button>
    </section>
  );
}