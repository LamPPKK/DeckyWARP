export const CustomTextBox = ({
  label,
  content,
}: {
  label: string;
  content: string;
}) => (
  <div style={{ width: "100%" }}>
    <div
      style={{
        fontSize: "12px",
        color: "rgba(255, 255, 255, 0.5)",
        marginBottom: "4px",
      }}
    >
      {label}
    </div>
    <div
      style={{
        whiteSpace: "pre-wrap",
        backgroundColor: "rgb(30, 34, 37)",
        color: "rgb(184, 188, 192)",
        padding: "10px",
        borderRadius: "4px",
      }}
    >
      {content}
    </div>
  </div>
);
