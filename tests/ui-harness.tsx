import { createRoot } from "react-dom/client";
import { AdminWorkspace } from "../src/features/admin/Workspace";
import { SavedSnapshot } from "../src/features/account/SavedSnapshot";
import snapshot from "./fixtures/reading-v1.json";
import { VideoLibrary } from "../src/features/admin/VideoLibrary";
import { PublicationConsent } from "../src/features/library/PublicationConsent";
createRoot(document.getElementById("root")!).render(
  location.search === "?library" ? (
    <VideoLibrary />
  ) : location.search === "?publication" ? (
    <PublicationConsent csrf="synthetic-csrf" />
  ) : location.search === "?snapshot" ? (
    <SavedSnapshot snapshot={snapshot} />
  ) : (
    <AdminWorkspace role="owner" />
  ),
);
