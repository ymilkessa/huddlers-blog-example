import "./App.css";
import React, { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Event, Metadata } from "./types";
import {
  Avatar,
  Collapse,
  Typography,
  CircularProgress,
  Box,
} from "@mui/material";

interface SingleBlogBoxProps {
  event: Event;
  author: Event;
  setExpandedPost: React.Dispatch<React.SetStateAction<string | null>>;
  expanded?: boolean;
}

const SingleBlogBox: React.FC<SingleBlogBoxProps> = ({
  event,
  author,
  setExpandedPost,
  expanded,
}) => {
  const getMetadataObject = useCallback((event: Event): Metadata => {
    try {
      return JSON.parse(event.content);
    } catch (e) {
      return {};
    }
  }, []);

  const toggleExpand = useCallback(() => {
    if (expanded) {
      setExpandedPost(null);
    } else {
      setExpandedPost(event.id);
    }
  }, [expanded, setExpandedPost]);

  if (event.kind !== 30023) {
    return null;
  }

  const metaData = getMetadataObject(author);
  const name = metaData.name || "Unknown";
  const picture =
    metaData.picture ||
    "https://yt3.ggpht.com/a/AATXAJy95ke01msPUiPiieinGX3qX7BDR5ozsqHXNQ=s900-c-k-c0xffffffff-no-rj-mo";

  return (
    <Box
      sx={{
        color: "text.primary",
        padding: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        onClick={toggleExpand}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "left",
          }}
        >
          <Avatar
            src={picture}
            alt="Profile"
            sx={{ width: 40, height: 40 }}
            title={name}
          />
          <Typography variant="h6" sx={{ marginLeft: "1rem", color: "white" }}>
            {name}
          </Typography>
        </div>
      </div>
      <Collapse in={expanded} sx={{ color: "white" }}>
        <ReactMarkdown>{event.content}</ReactMarkdown>
      </Collapse>
    </Box>
  );
};

// const filter: Filter = {
//   authors: [
//     "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
//     "04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9",
//     "b708f7392f588406212c3882e7b3bc0d9b08d62f95fa170d099127ece2770e5e",
//     "50d94fc2d8580c682b071a542f8b1e31a200b0508bab95a33bef0855df281d63",
//     "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
//     "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
//   ],
//   kinds: [30023],
// };

// const relays = ["wss://relay.primal.net"];

const cacheId =
  "7b77238f38a661f30de9584dbbdd4e9144a4bc860151181cc4533fce6de9b565";

const serverUrl = "https://api.huddlers.dev";
const fetchEndpoint = "/fetch";

const BlogsApp = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Event>>(new Map());
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(
        `${serverUrl}${fetchEndpoint}?cache_id=${cacheId}`,
        {
          mode: "cors",
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const eventsData = await response.json();

      if (eventsData.events && Array.isArray(eventsData.events)) {
        setEvents(eventsData.events);
        setProfiles(new Map(Object.entries(eventsData.profiles)));
        return eventsData.events.length;
      }
    } catch (err) {
      console.log("Error", err);
    }
    return 0;
  }, []);

  useEffect(() => {
    fetchEvents().then(() => setLoading(false));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "100vw",
      }}
    >
      <Typography variant="h4" sx={{ margin: "1rem", color: "white" }}>
        Recent Blogs
      </Typography>
      {events.map((element) => {
        let expanded = false;
        if (expandedPostId === element.id) {
          expanded = true;
        }
        return (
          <SingleBlogBox
            key={element.id}
            event={element}
            expanded={expanded}
            author={profiles.get(element.pubkey) as Event}
            setExpandedPost={setExpandedPostId}
          />
        );
      })}
      {loading && <CircularProgress />}
    </Box>
  );
};

export default BlogsApp;
