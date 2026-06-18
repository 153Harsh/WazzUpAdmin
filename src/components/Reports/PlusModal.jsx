import { useState, useEffect } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { toast } from "react-hot-toast";

const PlusModal = ({
  userId,
  plusModel,
  setPlusModel,
  fromNo,
  handleSendTemplates,
  repliedChatChecked,
  lessThan24Checked,
  tagsChecked,
  onRead,
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [queryData, setQueryData] = useState([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch users from API
  const fetchUsers = async (page = 1) => {
    if (loadingChats || !hasMore) return;
    setLoadingChats(true);
    try {
      const response = await axios.get(
        ` http://localhost:7821/api/admin/allUsersNo/${userId}`,
        {
          params: {
            page,
            limit: 30,
            search: searchInput.toLowerCase(),
            repliedChats: repliedChatChecked,
            lessThan24: lessThan24Checked,
            tagsPresent: tagsChecked,
            unread: onRead,
          },
        }
      );

      const newData = response.data.data;
      if (page === 1) {
        setQueryData(newData); // reset for first page
      } else {
        setQueryData((prev) => [...prev, ...newData]); // append for next pages
      }

      setHasMore(page < response.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoadingChats(false);
    }
  };

  // Refetch when search input changes
  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
    fetchUsers(1);
  }, [searchInput, repliedChatChecked, lessThan24Checked, tagsChecked, onRead]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 10 && hasMore && !loadingChats) {
      fetchUsers(currentPage + 1);
    }
  };

  if (!plusModel) return null;

  return (
    <div className="fixed inset-0 z-10 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-4 rounded-xl overflow-auto">
        {/* Search Input */}
        <div className="flex justify-between items-center gap-2 mb-2">
          <div className="flex items-center justify-between w-full border-2 px-3 py-1 border-gray-300 rounded-full bg-white">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search Mobile No or Name"
              className="outline-none w-full text-sm sm:text-base"
            />
            <FaSearch className="h-4 w-4 text-gray-500 flex-shrink-0 -mr-[6px]" />
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="35"
            fill="currentColor"
            className="bi bi-x cursor-pointer text-gray-500"
            viewBox="0 0 16 16"
            onClick={() => {
              setSearchInput("");
              setPlusModel(false);
            }}
          >
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
          </svg>
        </div>

        {/* List of Users */}
        <div
          onScroll={handleScroll}
          className="w-[320px] h-[350px] overflow-auto"
          style={{ scrollbarWidth: "none" }}
        >
            {queryData
                .slice()
                .sort((a, b) => (b.lastTimeStamp || 0) - (a.lastTimeStamp || 0))
                .map((item, index, arr) => (
                <div
                    key={item._id}
                    onClick={() => handleSendTemplates(item)}
                    className={`${
                    fromNo === item.From ? "text-black bg-green-200" : "text-black"
                    } flex flex-col justify-start items-start cursor-pointer w-30 h-auto overflow-auto rounded-xl`}
                >
                    <div className={`flex justify-start pl-3 w-full border-t-[1px] border-gray-100 ${(index === arr.length -1) && "border-b-[1px]"}`}>
                    <div className="flex-shrink-0 w-8 h-8 my-1 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-medium mr-2">
                        {item.Name?.[0] || item.profile?.[0] || item.From?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                        <p className="text-[14px] font-medium text-left p-1 my-1 truncate">
                            {item.Name || item.profile || item.From}
                        </p>
                        </div>
                    </div>
                    </div>
                </div>
                ))
            }

          {/* Skeleton Loader */}
          {loadingChats &&
            Array.from({
              length: queryData.length > 0 ? (queryData.length < 11 ? 11 - queryData.length : 4) : 11,
            }).map((_, index) => (
              <div
                key={index}
                className="flex flex-col justify-start items-start w-30 h-auto overflow-hidden bg-white relative border-t-[1px] mx-1"
              >
                <div className="absolute inset-0 transform -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-gray-100 to-transparent z-10"></div>
                <div className="flex justify-start items-center my-1 pl-3 pr-2 w-full relative z-20">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PlusModal;
