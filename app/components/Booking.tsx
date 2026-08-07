"use client";

import {
  type ChangeEvent,
  type FormEvent,
  useMemo,
  useState,
} from "react";

type BookingFormData = {
  name: string;
  email: string;
  instagram: string;
  phone: string;
  contactMethod: "Email" | "Instagram" | "Phone";
  placement: string;
  approximateSize: string;
  tattooStyle: string;
  colorPreference: string;
  preferredDate: string;
  alternateDate: string;
  budget: string;
  description: string;
  agreement: boolean;
};

const BOOKING_EMAIL = "zk.ink.kr@gmail.com";

const initialFormData: BookingFormData = {
  name: "",
  email: "",
  instagram: "",
  phone: "",
  contactMethod: "Email",
  placement: "",
  approximateSize: "",
  tattooStyle: "",
  colorPreference: "Black & Grey",
  preferredDate: "",
  alternateDate: "",
  budget: "",
  description: "",
  agreement: false,
};

const inputStyle = {
  width: "100%",
  minHeight: "48px",
  border: "1px solid #3a3a3a",
  borderRadius: "11px",
  padding: "12px 14px",
  background: "#121212",
  color: "#ffffff",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "grid",
  gap: "8px",
  color: "#e6e6e6",
  fontSize: "14px",
};

export default function Booking() {
  const ACCESS_KEY = "1126137d-0bf7-408b-bb5d-23566e39089f";
  const [formData, setFormData] =
    useState<BookingFormData>(initialFormData);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileSummary = useMemo(
    () =>
      referenceFiles.length === 0
        ? "No reference images selected"
        : `${referenceFiles.length} reference image${
            referenceFiles.length === 1 ? "" : "s"
          } selected`,
    [referenceFiles]
  );

  function updateField<K extends keyof BookingFormData>(
    field: K,
    value: BookingFormData[K]
  ) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    if (errorMessage) setErrorMessage("");
    if (isSubmitted) setIsSubmitted(false);
  }

  function handleReferenceImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files ?? []);
    const imageFiles = files.filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length !== files.length) {
      setErrorMessage("Please select image files only.");
      return;
    }

    if (imageFiles.length > 6) {
      setErrorMessage("You can upload up to 6 reference images.");
      return;
    }

    const oversizedFile = imageFiles.find(
      (file) => file.size > 10 * 1024 * 1024
    );

    if (oversizedFile) {
      setErrorMessage(
        "Each reference image must be smaller than 10 MB."
      );
      return;
    }

    setReferenceFiles(imageFiles);
    setErrorMessage("");
  }

  function removeReferenceImage(index: number) {
    setReferenceFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    );
  }

  function validateForm() {
    if (!formData.name.trim()) {
      return "Please enter your name.";
    }

    if (!formData.email.trim()) {
      return "Please enter your email address.";
    }

    if (!formData.phone.trim()) {
      return "Please enter your phone number.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return "Please enter a valid email address.";
    }

    if (!formData.placement.trim()) {
      return "Please enter the tattoo placement.";
    }

    if (!formData.approximateSize.trim()) {
      return "Please enter the approximate tattoo size.";
    }

    if (!formData.description.trim()) {
      return "Please describe your tattoo idea.";
    }

    if (!formData.agreement) {
      return "Please confirm that you understand the booking policy.";
    }

    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();

  const validationError = validateForm();

  if (validationError) {
    setErrorMessage(validationError);
    setIsSubmitted(false);
    return;
  }

  setErrorMessage("");
  setIsSubmitted(false);

  const fileNames =
    referenceFiles.length > 0
      ? referenceFiles.map((file) => file.name).join(", ")
      : "None";

  const submissionData = {
    access_key: "1126137d-0bf7-408b-bb5d-23566e39089f",

    subject: `New tattoo booking inquiry — ${formData.name}`,

    name: formData.name,
    email: formData.email,
    instagram: formData.instagram || "Not provided",
    phone: formData.phone || "Not provided",
    preferred_contact_method: formData.contactMethod,

    tattoo_placement: formData.placement,
    approximate_size: formData.approximateSize,
    tattoo_style: formData.tattooStyle || "Not specified",
    color_preference: formData.colorPreference,
    preferred_date: formData.preferredDate || "Flexible",
    alternate_date: formData.alternateDate || "Flexible",
    estimated_budget: formData.budget || "Not specified",

    tattoo_idea: formData.description,

    reference_image_filenames: fileNames,

    message: [
      "TATTOO BOOKING INQUIRY",
      "",
      `Name: ${formData.name}`,
      `Email: ${formData.email}`,
      `Instagram: ${formData.instagram || "Not provided"}`,
      `Phone: ${formData.phone || "Not provided"}`,
      `Preferred contact method: ${formData.contactMethod}`,
      "",
      `Placement: ${formData.placement}`,
      `Approximate size: ${formData.approximateSize}`,
      `Style: ${formData.tattooStyle || "Not specified"}`,
      `Color preference: ${formData.colorPreference}`,
      `Preferred date: ${formData.preferredDate || "Flexible"}`,
      `Alternate date: ${formData.alternateDate || "Flexible"}`,
      `Estimated budget: ${formData.budget || "Not specified"}`,
      "",
      "Tattoo idea:",
      formData.description,
      "",
      `Reference image filenames: ${fileNames}`,
      "",
      "Note: Reference images are not attached to this email.",
    ].join("\n"),
  };

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(submissionData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "The booking inquiry could not be sent.");
    }

    setIsSubmitted(true);
    setErrorMessage("");
  } catch (error) {
    console.error("Booking form submission error:", error);

    setIsSubmitted(false);
    setErrorMessage(
      "Your inquiry could not be sent. Please try again or contact ZKINK directly."
    );
  }
}

  function resetForm() {
    setFormData(initialFormData);
    setReferenceFiles([]);
    setErrorMessage("");
    setIsSubmitted(false);
  }

  return (
    <section
      id="booking"
      className="booking-section"
      style={{
        width: "100%",
        maxWidth: "1180px",
        margin: "0 auto",
        padding: "96px 20px 110px",
        color: "#ffffff",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        .booking-layout {
          display: grid;
          grid-template-columns: minmax(250px, 0.72fr) minmax(0, 1.28fr);
          gap: 36px;
          align-items: start;
        }

        .booking-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .booking-full-width {
          grid-column: 1 / -1;
        }

        .booking-field:focus,
        .booking-field:focus-visible {
          border-color: #8b8b8b !important;
          box-shadow: 0 0 0 3px rgba(255,255,255,0.06);
        }

        .booking-submit:hover {
          transform: translateY(-1px);
          background: #e9e9e9 !important;
        }

        .booking-secondary:hover {
          border-color: #666666 !important;
        }

        @media (max-width: 840px) {
          .booking-layout {
            grid-template-columns: 1fr;
          }

          .booking-aside {
            position: static !important;
            top: auto !important;
          }
        }

        @media (max-width: 620px) {
          .booking-section {
            padding: 56px 14px 90px !important;
          }

          .booking-layout {
            gap: 22px;
          }

          .booking-aside {
            position: static !important;
            top: auto !important;
            order: 2;
          }

          .booking-form {
            order: 1;
            padding: 18px !important;
          }

          .booking-form-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .booking-full-width {
            grid-column: auto;
          }

          .booking-field {
            font-size: 16px !important;
          }
        }
      `}</style>

      <header
        style={{
          textAlign: "center",
          marginBottom: "44px",
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            color: "#8b8b8b",
            fontSize: "13px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
          }}
        >
          Start your project
        </p>

        <h2
          style={{
            margin: 0,
            fontSize: "clamp(40px, 6vw, 64px)",
            fontWeight: 500,
            letterSpacing: "-0.045em",
          }}
        >
          Booking
        </h2>

        <p
          style={{
            maxWidth: "680px",
            margin: "16px auto 0",
            color: "#949494",
            fontSize: "16px",
            lineHeight: 1.65,
          }}
        >
          Share as much detail as possible about your tattoo idea.
          Your information will be reviewed before appointment
          availability and pricing are confirmed.
        </p>
      </header>

      <div className="booking-layout">
        <aside
          className="booking-aside"
          style={{
            position: "sticky",
            top: "110px",
            display: "grid",
            gap: "18px",
          }}
        >
          <div
            style={{
              border: "1px solid #303030",
              borderRadius: "16px",
              padding: "22px",
              background: "#111111",
            }}
          >
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: "20px",
                fontWeight: 500,
              }}
            >
              Before submitting
            </h3>

            <div
              style={{
                display: "grid",
                gap: "14px",
                color: "#a7a7a7",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              <p style={{ margin: 0 }}>
                Include clear photos of the placement area and any
                reference images that communicate the mood, subject,
                or composition you want.
              </p>

              <p style={{ margin: 0 }}>
                Final pricing depends on size, placement, complexity,
                and the estimated session time.
              </p>

              <p style={{ margin: 0 }}>
                A 30% non-refundable deposit is generally required to
                confirm an appointment and begin design preparation.
              </p>
            </div>
          </div>

          <div
            style={{
              border: "1px solid #303030",
              borderRadius: "16px",
              padding: "22px",
              background: "#111111",
            }}
          >
            <p
              style={{
                margin: "0 0 6px",
                color: "#767676",
                fontSize: "12px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              Studio
            </p>

            <p
              style={{
                margin: 0,
                fontSize: "17px",
                lineHeight: 1.6,
              }}
            >
              San Francisco, California
            </p>
          </div>
        </aside>

        <form
          className="booking-form"
          onSubmit={handleSubmit}
          noValidate
          style={{
            border: "1px solid #303030",
            borderRadius: "18px",
            padding: "clamp(20px, 4vw, 34px)",
            background: "#0e0e0e",
          }}
        >
          <div className="booking-form-grid">
            <label style={labelStyle}>
              Name <span style={{ color: "#7f7f7f" }}>*</span>
              <input
                className="booking-field"
                type="text"
                value={formData.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                autoComplete="name"
                placeholder="Your full name"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Email <span style={{ color: "#7f7f7f" }}>*</span>
              <input
                className="booking-field"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                autoComplete="email"
                placeholder="you@example.com"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Instagram
              <input
                className="booking-field"
                type="text"
                value={formData.instagram}
                onChange={(event) =>
                  updateField("instagram", event.target.value)
                }
                placeholder="@username"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Phone <span style={{ color: "#7f7f7f" }}>*</span>
              <input
                className="booking-field"
                type="tel"
                value={formData.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                autoComplete="tel"
                placeholder="Your phone number"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Preferred contact method
              <select
                className="booking-field"
                value={formData.contactMethod}
                onChange={(event) =>
                  updateField(
                    "contactMethod",
                    event.target.value as BookingFormData["contactMethod"]
                  )
                }
                style={inputStyle}
              >
                <option>Email</option>
                <option>Instagram</option>
                <option>Phone</option>
              </select>
            </label>

            <label style={labelStyle}>
              Tattoo placement{" "}
              <span style={{ color: "#7f7f7f" }}>*</span>
              <input
                className="booking-field"
                type="text"
                value={formData.placement}
                onChange={(event) =>
                  updateField("placement", event.target.value)
                }
                placeholder="Example: inner forearm"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Approximate size{" "}
              <span style={{ color: "#7f7f7f" }}>*</span>
              <input
                className="booking-field"
                type="text"
                value={formData.approximateSize}
                onChange={(event) =>
                  updateField("approximateSize", event.target.value)
                }
                placeholder="Example: 5 × 7 inches"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Style
              <select
                className="booking-field"
                value={formData.tattooStyle}
                onChange={(event) =>
                  updateField("tattooStyle", event.target.value)
                }
                style={inputStyle}
              >
                <option value="">Select a style</option>
                <option>Black & Grey</option>
                <option>Realism</option>
                <option>Portrait</option>
                <option>Fine Line</option>
                <option>Illustrative</option>
                <option>Geometric</option>
                <option>Cover-up</option>
                <option>Other / Not sure</option>
              </select>
            </label>

            <label style={labelStyle}>
              Color preference
              <select
                className="booking-field"
                value={formData.colorPreference}
                onChange={(event) =>
                  updateField("colorPreference", event.target.value)
                }
                style={inputStyle}
              >
                <option>Black & Grey</option>
                <option>Color</option>
                <option>Mostly Black & Grey with accents</option>
                <option>Not sure</option>
              </select>
            </label>

            <label style={labelStyle}>
              Preferred date
              <input
                className="booking-field"
                type="date"
                value={formData.preferredDate}
                onChange={(event) =>
                  updateField("preferredDate", event.target.value)
                }
                style={{
                  ...inputStyle,
                  colorScheme: "dark",
                }}
              />
            </label>

            <label style={labelStyle}>
              Alternate date
              <input
                className="booking-field"
                type="date"
                value={formData.alternateDate}
                onChange={(event) =>
                  updateField("alternateDate", event.target.value)
                }
                style={{
                  ...inputStyle,
                  colorScheme: "dark",
                }}
              />
            </label>

            <label style={labelStyle}>
              Estimated budget
              <input
                className="booking-field"
                type="text"
                value={formData.budget}
                onChange={(event) =>
                  updateField("budget", event.target.value)
                }
                placeholder="Optional"
                style={inputStyle}
              />
            </label>

            <label
              className="booking-full-width"
              style={labelStyle}
            >
              Describe your tattoo idea{" "}
              <span style={{ color: "#7f7f7f" }}>*</span>
              <textarea
                className="booking-field"
                value={formData.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Describe the subject, meaning, composition, preferred style, existing tattoos nearby, and anything else that may help."
                rows={7}
                style={{
                  ...inputStyle,
                  minHeight: "150px",
                  resize: "vertical",
                  lineHeight: 1.6,
                }}
              />
            </label>

            <div
              className="booking-full-width"
              style={{
                display: "grid",
                gap: "10px",
              }}
            >
              <label style={labelStyle}>
                Reference images
                <input
                  className="booking-field"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReferenceImages}
                  style={{
                    ...inputStyle,
                    padding: "10px",
                    cursor: "pointer",
                  }}
                />
              </label>

              <p
                style={{
                  margin: 0,
                  color: "#777777",
                  fontSize: "12px",
                  lineHeight: 1.5,
                }}
              >
                {fileSummary}. Up to 6 images, 10 MB each.
              </p>

              {referenceFiles.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gap: "8px",
                  }}
                >
                  {referenceFiles.map((file, index) => (
                    <div
                      key={`${file.name}-${file.lastModified}`}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        border: "1px solid #303030",
                        borderRadius: "9px",
                        padding: "9px 11px",
                        background: "#151515",
                      }}
                    >
                      <span
                        style={{
                          minWidth: 0,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          color: "#bcbcbc",
                          fontSize: "13px",
                        }}
                      >
                        {file.name}
                      </span>

                      <button
                        type="button"
                        onClick={() => removeReferenceImage(index)}
                        style={{
                          border: 0,
                          padding: "4px 6px",
                          background: "transparent",
                          color: "#929292",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label
              className="booking-full-width"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                color: "#9a9a9a",
                fontSize: "13px",
                lineHeight: 1.55,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={formData.agreement}
                onChange={(event) =>
                  updateField("agreement", event.target.checked)
                }
                style={{
                  width: "17px",
                  height: "17px",
                  marginTop: "2px",
                  accentColor: "#ffffff",
                }}
              />
              <span>
                I understand that submitting this form does not confirm
                an appointment. Pricing, availability, and the required
                non-refundable deposit will be confirmed separately.
              </span>
            </label>

            {errorMessage && (
              <div
                className="booking-full-width"
                role="alert"
                style={{
                  border: "1px solid #6f3030",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  background: "#291313",
                  color: "#efb4b4",
                  fontSize: "14px",
                }}
              >
                {errorMessage}
              </div>
            )}

            {isSubmitted && (
              <div
                className="booking-full-width"
                role="status"
                style={{
                  border: "1px solid #36553d",
                  borderRadius: "10px",
                  padding: "12px 14px",
                  background: "#132218",
                  color: "#bfe3c7",
                  fontSize: "14px",
                  lineHeight: 1.55,
                }}
              >
                Your email draft should now be open. Please attach the
                selected reference images before sending.
              </div>
            )}

            <div
              className="booking-full-width"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) auto",
                gap: "12px",
                marginTop: "4px",
              }}
            >
              <button
                className="booking-submit"
                type="submit"
                style={{
                  minHeight: "52px",
                  border: 0,
                  borderRadius: "11px",
                  padding: "13px 20px",
                  background: "#ffffff",
                  color: "#111111",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition:
                    "transform 180ms ease, background 180ms ease",
                }}
              >
                Submit booking inquiry
              </button>

              <button
                className="booking-secondary"
                type="button"
                onClick={resetForm}
                style={{
                  minHeight: "52px",
                  border: "1px solid #3a3a3a",
                  borderRadius: "11px",
                  padding: "13px 18px",
                  background: "#151515",
                  color: "#cfcfcf",
                  fontSize: "14px",
                  cursor: "pointer",
                  transition: "border-color 180ms ease",
                }}
              >
                Clear
              </button>
            </div>

            <p
              className="booking-full-width"
              style={{
                margin: 0,
                color: "#666666",
                fontSize: "11px",
                lineHeight: 1.55,
              }}
            >
              Reference files cannot be attached automatically through
              an email draft. Attach the selected images manually before
              sending your message.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
