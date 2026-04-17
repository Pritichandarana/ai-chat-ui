import { useUI } from "../../context/UIContext";

export default function Toast() {
  const { toast } = useUI();

  if (!toast) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[999]">
      <div
        className={`px-4 py-2 rounded shadow-lg text-white ${
          toast.type === "error"
            ? "bg-red-500"
            : toast.type === "success"
              ? "bg-green-500"
              : "bg-gray-700"
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
}
