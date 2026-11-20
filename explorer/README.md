# Bookmark Explorer

MarkNest本体とは別の学習用Chrome拡張。Chrome 120以上。
Chromeの拡張機能管理からこのexplorerフォルダを読み込む。
検索はタイトルとURLの部分一致。フォルダは直下のみ。
追加日時欠損は末尾相当。同じURLでもIDが違えば別件。
並べ替えとURL表示だけstorage.localへ保存する。
ブックマーク編集・ページ取得・外部送信は行わない。
権限自体は書込も可能なので練習用Chromeプロファイルで使う。
一覧は取得時点の状態。Chrome側の変更後は再読み込みする。
テスト: プロジェクトルートでnpm ci、npm run check。
実機未確認項目は配布教材docs/CHROME_CHECKLIST.mdを参照。
