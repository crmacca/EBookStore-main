import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import { ReactReader } from "react-reader";

const BookReader = () => {
  const params = useParams();
  const [reading, setReading] = useState(false);
  const [location, setLocation] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookData, setBookData] = useState(null);
  const [epubFilePath, setEpubFilePath] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BACKEND_URL}/api/books/${params.id}/details`
        );
        setBookData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching book details:", error);
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [params.id]);

  const downloadEpubFile = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/books/${params.id}/epub`,
        {
          responseType: "blob", // Specify response type as blob to handle binary data
        }
      );
      const blob = new Blob([response.data], { type: "application/epub+zip" });
      const url = window.URL.createObjectURL(blob);
      setEpubFilePath(url);
      setReading(true);
    } catch (error) {
      console.error("Error downloading EPUB file:", error);
      toast.error("Failed to download EPUB file.");
    }
  };

  if (!bookData) {
    return <div className="text-center mt-20">Book not found.</div>;
  }

  return (
    <div className="bg-orange-50 w-full min-h-screen font-merriweather">
      <div className="max-w-7xl m-auto min-h-screen p-4 md:p-20 flex flex-col">
        <div className="flex items-center justify-start gap-2">
          <img
            alt="CornerOfBooks Logo"
            src="/logoSM.png"
            className="w-40 hidden md:block"
          />
          <div>
            <h1 className="text-zinc-900 font-merriweather text-7xl font-bold">
              E-Book
            </h1>
            <h1 className="text-zinc-900 font-merriweather text-5xl font-regular">
              Corner Store
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2 h-full font-merriweather text-2xl font-bold">
            <button
              onClick={() => (window.location.pathname = "/app")}
              className="bg-zinc-900 flex-grow rounded-lg my-5 text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200"
            >
              My Bookshelf
            </button>
          </div>
        </div>

        {!reading && (
          <p className="text-2xl pt-2">
            Your one-stop shop for the <u>world's <b>worst</b></u> e-books!
          </p>
        )}

        {!reading && !loading && (
          <div className="grid md:grid-cols-2 p-10">
            <img
              className="rounded-xl border-3 border-black shadow w-[80%] h-full object-cover overflow-hidden"
              alt={`${bookData.title}'s Cover Illustration`}
              src={`${process.env.REACT_APP_BACKEND_URL}/api/books/${bookData.id}/cover`}
            />
            <div>
              <h1 className="font-extrabold text-5xl">{bookData.title}</h1>
              <h1 className="text-xl font-light mt-3">
                {bookData.description}
              </h1>

              <button
                onClick={downloadEpubFile}
                className="bg-zinc-900 w-full mt-2 rounded-lg text-white p-2 border-[4px] border-zinc-900 hover:bg-transparent hover:text-zinc-900 duration-200"
              >
                Read Book
              </button>

              <p className="select-none text-xs mt-2">
                <b>© {new Date().getFullYear()} ChrisMC Developments</b>
                <br />
                By pressing the button above & reading this book, you agree to
                the{" "}
                <a
                  className="underline cursor-pointer"
                  onClick={() => (window.location.pathname = "/policies/use")}
                >
                  acceptable use policy
                </a>{" "}
                of this site.
              </p>
            </div>
          </div>
        )}

        {reading && epubFilePath && (
          <div className="h-[70vh]">
            <ReactReader
              url={epubFilePath}
              epubInitOptions={{
                openAs: 'epub'
              }}
              location={location}
              locationChanged={(epubcfi) => setLocation(epubcfi)}
            />
          </div>
        )}
      </div>
      <div className="fixed bottom-0 left-0 w-full flex items-center justify-center py-2">
        <h1>
          (For legal reasons) This entire site is a joke. | ©{" "}
          {new Date().getFullYear()} ChrisMC Developments| <a className='underline cursor-pointer' onClick={() => {window.location.pathname = '/policies/use'}}>Acceptable Use Policy</a>
        </h1>
      </div>
    </div>
  );
};

export default BookReader;
