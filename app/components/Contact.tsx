"use client";
export default function Contact() {
  return (
    <section
      id="contact"
      style={{
        maxWidth: "700px",
        margin: "120px auto",
        textAlign: "center",
        padding: "0 20px",
      }}
    >
      <h2
        style={{
          fontSize: "56px",
          fontWeight: 700,
          marginBottom: "20px",
        }}
      >
        Contact
      </h2>

      <p
        style={{
          color: "#888",
          fontSize: "18px",
          marginBottom: "50px",
        }}
      >
        Feel free to reach out for tattoo inquiries or bookings.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "50px",
          flexWrap: "wrap",
        }}
      >
        <a
          href="mailto:zkinktattoo@gmail.com"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: "22px",
            fontWeight: 500,
            transition: ".25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.65";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          ✉ Email
        </a>

        <a
          href="https://www.instagram.com/zk.ink?igsh=NTc4MTIwNjQ2YQ=="
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#fff",
            textDecoration: "none",
            fontSize: "22px",
            fontWeight: 500,
            transition: ".25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.65";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          Instagram
        </a>
      </div>
    </section>
  );
}