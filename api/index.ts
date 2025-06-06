

//for testing code for localhost

// import express, { Request, Response } from "express";
// import axios from "axios";
// import cors from "cors";
// import { XMLParser } from "fast-xml-parser";
// import he from "he"; 

// const PORT = process.env.PORT || 3000;
// const app = express();

// app.use(cors());

// // Health check
// app.get("/", (_req: Request, res: Response) => {
//   res.json({ message: "API is running " });
// });

// // Transcript route
// app.get("/transcript/:id", async (req: Request, res: Response) => {
//   const videoId = req.params.id;

//   if (!videoId) {
//      res.status(400).json({ success: false, message: "Missing video ID" });
//      return;
//   }

//   try {
//     const transcript = await fetchTranscriptData(videoId);
//     res.json({ success: true, transcript });
//   } catch (err: any) {
//     res.status(500).json({
//       success: false,
//       message: err.message || "Failed to fetch transcript",
//     });
//   }
// });

// // Fetch transcript data
// async function fetchTranscriptData(videoId: string) {
//   const ytResponse = await axios.post(
//     "https://www.youtube.com/youtubei/v1/player",
//     {
//       context: {
//         client: {
//           clientName: "WEB",
//           clientVersion: "2.20250605.01.00",
//           platform: "DESKTOP",
//           userAgent:
//             "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
//           clientScreen: "WATCH",
//         },
//       },
//       videoId,
//     },
//     {
//       headers: {
//         "Content-Type": "application/json",
//         "User-Agent":
//           "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
//         "X-YouTube-Client-Name": "1",
//         "X-YouTube-Client-Version": "2.20250605.01.00",
//       },
//       params: {
//         key: "AIzaSyC-5K2b7U5eVq7wUvlS1yzG9M2W1tKY2dg", // Public key
//       },
//     }
//   );

//   const tracks = ytResponse.data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

//   if (!tracks || tracks.length === 0) {
//     throw new Error("No caption tracks found.");
//   }

//   const selectedTrack = tracks.find((t: any) => t.languageCode === "en") || tracks[0];
//   const transcriptUrl = selectedTrack.baseUrl;

//   const transcriptRes = await axios.get(transcriptUrl, {
//     headers: {
//       "User-Agent":
//         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
//     },
//   });

//   const parser = new XMLParser({
//     ignoreAttributes: false,
//     attributeNamePrefix: "",
//   });

//   const parsed = parser.parse(transcriptRes.data);
//   const textNodes = parsed.transcript?.text || [];

//   const transcriptArray = Array.isArray(textNodes) ? textNodes : [textNodes];

//   return transcriptArray.map((item: any) => ({
//     start: parseFloat(item.start),
//     dur: parseFloat(item.dur),
//     text: he.decode(item["#text"] || ""),
//   }));
// }

// // Start server
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });




// api/transcript.ts for vercel only
import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import he from 'he';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const videoId = req.query.id as string;

  if (!videoId) {
    return res.status(400).json({ success: false, message: "Missing video ID" });
  }

  try {
    const transcript = await fetchTranscriptData(videoId);
    return res.status(200).json({ success: true, transcript });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

async function fetchTranscriptData(videoId: string) {
  const ytResponse = await axios.post(
    "https://www.youtube.com/youtubei/v1/player",
    {
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20250605.01.00",
          platform: "DESKTOP",
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
          clientScreen: "WATCH",
        },
      },
      videoId,
    },
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
        "X-YouTube-Client-Name": "1",
        "X-YouTube-Client-Version": "2.20250605.01.00",
      },
      params: {
        key: "AIzaSyC-5K2b7U5eVq7wUvlS1yzG9M2W1tKY2dg",
      },
    }
  );

  const tracks = ytResponse.data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

  if (!tracks || tracks.length === 0) {
    throw new Error("No caption tracks found.");
  }

  const selectedTrack = tracks.find((t: any) => t.languageCode === "en") || tracks[0];
  const transcriptUrl = selectedTrack.baseUrl;

  const transcriptRes = await axios.get(transcriptUrl);

  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  const parsed = parser.parse(transcriptRes.data);

  const textNodes = parsed.transcript?.text || [];
  const transcriptArray = Array.isArray(textNodes) ? textNodes : [textNodes];

  return transcriptArray.map((item: any) => ({
    start: parseFloat(item.start),
    dur: parseFloat(item.dur),
    text: he.decode(item["#text"] || ""),
  }));
}
