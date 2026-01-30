import TimelineItem from "./TimelineItem";

export default function Timeline({ status }) {
  const steps = [
    { key: "PENDING", label: "Submitted" },
    { key: "ASSIGNED", label: "Assigned" },
    { key: "IN_PROGRESS", label: "In Progress" },
    { key: "RESOLVED", label: "Resolved" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <TimelineItem
          key={step.key}
          title={step.label}
          active={index <= currentIndex}
        />
      ))}
    </div>
  );
}
