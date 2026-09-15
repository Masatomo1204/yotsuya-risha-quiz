四谷大塚 理社一問一答アプリ
GitHub初期登録用スターター一式

■ このZIPの目的
GitHubの空リポジトリ「yotsuya-risha-quiz」に最初に登録するための最小構成です。
そのままアップロードすれば、サンプル問題を使って一問一答アプリとして動きます。

■ ファイル構成
index.html
style.css
app.js
config.js
sample-questions.json
README.txt
.gitignore

■ 現在できること
・理科 / 社会の切り替え
・回ごとの絞り込み
・未回答 / できた / 要復習の絞り込み
・ヒント表示
・答え表示
・できた / 要復習の自己判定
・iPhoneブラウザ内に進捗を保存
・サンプル問題で即時動作

■ v1.3の考え方を反映している項目
問題JSONに以下の項目を持たせています。
・knowledge_element_id
・probe_type
・runtime_visual_dependency

Visual Assetはこの初期版ではまだ表示しません。
今後は、Visual Fact / Visual Inferenceを問題生成側で構築し、
本当に画像が必要な問題のみ runtime_visual_dependency を高くして扱う想定です。

■ GitHubへアップロードする方法（iPhone）
1. GitHubの yotsuya-risha-quiz リポジトリを開く
2. 「uploading an existing file」をタップ
3. ZIPを一度iPhoneの「ファイル」アプリで展開する
4. 展開した中の7ファイルをすべて選択してGitHubへアップロードする
5. Commit changes を実行

注意:
GitHubのWeb画面ではZIPそのものを置くだけではWebアプリとして動きません。
ZIPの中身を展開してアップロードしてください。

■ Supabase連携について
config.jsにSupabase用の設定欄を用意してあります。
現時点では useSupabase: false のため、sample-questions.json を読みます。

次段階では以下の順で進めるのがおすすめです。
1. Supabaseのテーブル設計
2. 問題データの登録
3. app.jsのloadQuestions()をSupabase取得へ切り替え
4. 学習履歴をSupabaseへ保存
5. 子供別・教科別・Knowledge別の習熟度管理
6. daily-risha-question-generation-v1.3の生成物を直接投入できる形式へ統一

■ セキュリティ
service_role keyはブラウザのコードに絶対に入れないでください。
フロント側では anon keyだけを利用してください。
