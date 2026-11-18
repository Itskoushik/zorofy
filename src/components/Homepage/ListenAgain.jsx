"use client";
import ListenAgainCard from "../ListenAgainCard";
import { useLayoutEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setAutoAdd } from "@/redux/features/playerSlice";
import { setLanguages } from "@/redux/features/languagesSlice";

const ListenAgain = () => {
  const [songHistory, setSongHistory] = useState([]);
  const dispatch = useDispatch();
  useLayoutEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("songHistory") || "[]");
      setSongHistory(Array.isArray(history) ? history : []);
      dispatch(setAutoAdd(localStorage.getItem("autoAdd") === "true"));
    } catch {
      setSongHistory([]);
      dispatch(setAutoAdd(false));
    }
  }, []);

  return (
    <div>
      {/* Listen Again */}
      {songHistory?.length > 0 && (
        <div id="recently-played" className="scroll-mt-24">
          <h2 className=" text-white mt-4 text-2xl lg:text-3xl font-semibold mb-4 ">
            Listen Again
          </h2>
          <div className=" grid grid-cols-2 lg:grid-cols-3 gap-x-10">
            {songHistory?.map((song, index) => (
              <ListenAgainCard
                key={song?.id}
                song={song}
                SongData={songHistory}
                index={index}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ListenAgain;
