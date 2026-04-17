import { useContext, useState, useEffect } from "react";
import { ChatContext } from "../../context/ChatContext";
import { useAuth } from "../../context/AuthContext";
import authFetch from "../../utils/authFetch";

export default function Sidebar({ open, setOpen }) {
  const { chats, setActiveChat, createNewChat, setChats } =
    useContext(ChatContext);

  const { logout } = useAuth();

  const [hiddenChats, setHiddenChats] = useState([]);
  const [showHistory, setShowHistory] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // ✅ Detect screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setOpen(false);
      else setOpen(true);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ DELETE CHAT
  const deleteChat = async (id) => {
    if (!confirm("Delete this chat?")) return;

    try {
      await authFetch(`/api/chats/${id}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ HIDE CHAT
  const toggleHide = (id) => {
    setHiddenChats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isMobile && open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`
          fixed top-0 left-0 md:relative z-[100]
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${open ? "w-64" : "w-16"}
          transition-all duration-300
          bg-white dark:bg-[#202123]
          text-black dark:text-white
          border-r dark:border-gray-700
          flex flex-col h-screen md:h-full
        `}
      >
        {/* TOP */}
        <div className="p-2 space-y-2">
          <div className="flex items-center justify-between">
            <button onClick={() => setOpen(!open)} className="text-sm">
              {open ? "⬅" : "➡"}
            </button>

            {open && <h2 className="font-semibold">Chats</h2>}
          </div>

          {open && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-2 py-1 text-xs border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {showHistory ? "Hide History" : "Show History"}
            </button>
          )}
        </div>

        {/* NEW CHAT */}
        <button
          onClick={createNewChat}
          className="p-2 mx-2 text-sm border rounded hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          + New Chat
        </button>

        {/* CHAT LIST (SCROLL AREA) */}
        <div className="flex-1 min-h-0 px-1 mt-2 space-y-1 overflow-y-auto">
          {showHistory &&
            chats
              .filter((chat) => !hiddenChats.includes(chat._id))
              .map((chat) => (
                <div
                  key={chat._id}
                  className="flex items-center justify-between px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span
                    onClick={() => {
                      setActiveChat(chat);
                      if (isMobile) setOpen(false);
                    }}
                    className="text-sm truncate cursor-pointer"
                  >
                    {chat.messages?.[0]?.content?.slice(0, 25) ||
                      chat.title ||
                      "New Chat"}
                  </span>

                  {open && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleHide(chat._id)}
                        className="text-xs text-yellow-500 hover:text-yellow-700"
                      >
                        👁
                      </button>

                      <button
                        onClick={() => deleteChat(chat._id)}
                        className="text-xs text-red-500 hover:text-red-700"
                      >
                        🗑
                      </button>
                    </div>
                  )}
                </div>
              ))}
        </div>

        {/* HIDDEN CHATS */}
        {open && hiddenChats.length > 0 && (
          <div className="p-2 border-t dark:border-gray-700">
            <p className="mb-1 text-xs text-gray-500">Hidden</p>

            {chats
              .filter((chat) => hiddenChats.includes(chat._id))
              .map((chat) => (
                <div
                  key={chat._id}
                  className="flex justify-between px-2 py-1 text-xs"
                >
                  <span>
                    {chat.messages?.[0]?.content?.slice(0, 20) || chat.title}
                  </span>

                  <button
                    onClick={() => toggleHide(chat._id)}
                    className="text-green-500 hover:text-green-600"
                  >
                    Show
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* LOGOUT (ALWAYS VISIBLE) */}
        <div className="p-2 mt-auto">
          <button
            onClick={logout}
            className="w-full p-2 text-white bg-red-500 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
}
