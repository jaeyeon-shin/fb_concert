// HomePage.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import Button from "../components/Button";
import photoIcon from "../assets/icons/photo.png";
import ticketIcon from "../assets/icons/ticket.png";
import musicIcon from "../assets/icons/music.png";

export default function HomePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [bgImageUrl, setBgImageUrl] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "records", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("✅ Firestore 데이터:", data);
          setBgImageUrl(data.bgImageUrl || "");
        } else {
          console.log("❌ 해당 userId로 등록된 문서가 없습니다.");
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error("Firestore 요청 오류:", error);
        setIsAuthorized(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-black text-white text-xl">
        ⚠️ 이 NFC 칩은 등록되지 않았습니다.
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center space-y-10"
      style={{ backgroundImage: `url(${bgImageUrl})` }}
    >
      <Button icon={ticketIcon} label="TICKET" onClick={() => navigate("/ticket")} />
      <Button icon={photoIcon} label="PHOTO" onClick={() => navigate("/photo")} />
      <Button icon={musicIcon} label="SETLIST" onClick={() => navigate("/setlist")} />
    </div>
  );
}
