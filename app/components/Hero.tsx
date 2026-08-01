export default function Hero() {
  return (
    <section
      style={{
        minHeight: "70vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "80px 20px",
      }}
    >
      <h1
        style={{
          fontSize: "64px",
          marginBottom: "20px",
        }}
      >
        ZK TATTOO
      </h1>

      <p
        style={{
          fontSize: "22px",
          color: "#777",
          maxWidth: "700px",
          lineHeight: 1.6,
        }}
      >
        Preview your tattoo before getting inked.
        <br />
        Explore my portfolio and experience AI Tattoo Try-On.
      </p>

      <button
        style={{
          marginTop: "40px",
          padding: "16px 40px",
          fontSize: "18px",
          borderRadius: "10px",
          border: "none",
          cursor: "pointer",
          background: "#111",
          color: "#fff",
        }}
      >
        Try Tattoo Preview
      </button>
    </section>
  );
}