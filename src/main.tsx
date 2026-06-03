// 進入點：掛載 App 到 #root
// 註：不使用 StrictMode，以保持與原單檔版本完全相同的 render 行為
//（App 在 render 階段以 Object.assign 同步全域 C/CB，StrictMode 的 dev 雙重 render 雖無害但可能造成除錯時的困惑）。
import { createRoot } from "react-dom/client";
import App from "./App";

const el = document.getElementById("root");
if (el) {
  createRoot(el).render(<App />);
}
