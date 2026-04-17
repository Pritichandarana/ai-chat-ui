import { useUI } from "../../context/UIContext";

export default function Loader() {
  const { loading } = useUI();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-[998] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-white rounded-full border-t-transparent animate-spin"></div>
    </div>
  );
}
