import "./App.css";
import React, { useCallback, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Event, Metadata, Filter } from "./types";
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

const filter: Filter = {
  authors: [
    "82341f882b6eabcd2ba7f1ef90aad961cf074af15b9ef44a09f9d2a8fbfbe6a2",
    "04c915daefee38317fa734444acee390a8269fe5810b2241e5e6dd343dfbecc9",
    "b708f7392f588406212c3882e7b3bc0d9b08d62f95fa170d099127ece2770e5e",
    "50d94fc2d8580c682b071a542f8b1e31a200b0508bab95a33bef0855df281d63",
    "3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d",
    "fa984bd7dbb282f07e16e7ae87b26a2a7b9b90b7246a44771f0cf5ae58018f52",
  ],
  kinds: [30023],
};

const relays = ["wss://relay.primal.net"];

const urlToUse = "https://api.huddlers.dev/cache";

const BlogsApp = () => {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Event>>(new Map());
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch(urlToUse, {
        mode: "cors",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filter,
          relays,
        }),
      });
      const data = await response.json();
      if (data.events && Array.isArray(data.events)) {
        setEvents(data.events);
        setProfiles(new Map(Object.entries(data.profiles)));
        return data.events.length;
      }
    } catch (err) {
      console.log("Error", err);
    }
    return 0;
  }, []);

  const runInitialFetches = useCallback(async () => {
    for (let i = 0; i < 1; i++) {
      const numOfEvs = await fetchEvents();
      if (numOfEvs > 0) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 4000));
    }
    setLoading(false);
  }, [fetchEvents, setLoading]);

  useEffect(() => {
    runInitialFetches();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

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
    </Box>
  );
};

export default BlogsApp;
