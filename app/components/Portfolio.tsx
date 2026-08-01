export default function Portfolio() {
  const works = [
    "/portfolio/1.jpg",
    "/portfolio/2.jpg",
    "/portfolio/3.jpg",
    "/portfolio/4.jpg",
  ];

  return (
    <section
      style={{
        padding: "80px 20px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "42px",
          marginBottom: "50px",
        }}
      >
        Featured Portfolio
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
        }}
      >
        {works.map((image, index) => (
          <div
            key={index}
            style={{
              aspectRatio: "1",
              borderRadius: "18px",
              overflow: "hidden",
              background: "#222",
            }}
          >
            <img
              src={image}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}