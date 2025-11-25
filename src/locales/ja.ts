export const ja = {
  // Button labels
  startExperiment: '実験を開始',
  next: '次へ',
  submit: '送信',
  exportData: 'データをエクスポート',
  exportCSV: 'CSVをエクスポート',
  exportJSON: 'JSONをエクスポート',
  
  // Participant ID input
  participantIdLabel: '参加者ID',
  participantIdPlaceholder: '参加者IDを入力してください',
  participantIdRequired: '参加者IDを入力してください',
  
  // Task instructions
  taskATitle: 'タスクA: 最短経路のエッジ数の判定',
  taskAInstruction: '2つのハイライトされたノードの間を、エッジでつないでいくとき、最短で何本のエッジを通ればよいかを判定してください。\n答えは「エッジ2本」（エッジを2本通る）か「エッジ3本以上」（エッジを3本以上通る）のどちらかです。「エッジ2本」または「エッジ3本以上」のボタンをクリックして回答してください。',
  taskBTitle: 'タスクB: 共通隣接ノードの選択',
  taskBInstruction: '2つのハイライトされたノードの両方に、エッジでつながっているノードをすべて選択してください。\nノードをクリックして選択し、すべて選択したら「次へ進む」をクリックしてください。',
  
  // Task display
  highlightedNodes: 'ハイライトされたノード',
  node1: 'ノード1',
  node2: 'ノード2',
  distance2: 'エッジ2本',
  distance3: 'エッジ3本以上',
  proceedNext: '次へ進む',
  
  // Survey
  surveyTitle: '主観評価',
  clarity: '明確さ',
  fatigue: '疲労',
  clarityQuestion: 'グラフの構造は理解しやすかったですか？',
  fatigueQuestion: 'この問題に疲労感を感じましたか？',
  notAtAll: '全くない',
  veryMuch: '非常に',
  
  // Summary
  experimentComplete: '実験完了',
  summaryMessage: '実験が完了しました。ご協力ありがとうございました。',
  totalTrials: '総トライアル数',
  correctAnswers: '正解数',
  averageRT: '平均反応時間',
  
  // Status messages
  dataSaved: 'データを保存しました',
  dataExported: 'データをエクスポートしました',
  loading: '読み込み中...',
  
  // Error messages
  errorOccurred: 'エラーが発生しました',
  errorLoadingGraph: 'グラフの読み込みに失敗しました',
  errorLoadingConditions: '条件ファイルの読み込みに失敗しました',
  
  // Trial status
  trialNumber: 'トライアル',
  of: 'の',
  taskA: 'タスクA',
  taskB: 'タスクB',
  
  // Instruction screens
  instructionTaskA: 'これから最短経路のエッジ数を判定するタスクを行います。\n\n【ノードリンク図について】\nこの実験では「ノードリンク図」を使います。ノードリンク図は以下の要素でできています：\n・ノード（点）：丸い点で表されます\n・エッジ（線）：2つの点を結ぶ線です\n・経路：いくつかのエッジをたどって、あるノードから別のノードへ移動する道筋です\n・エッジの本数：ある経路を構成するエッジの本数です\n\n【タスクの内容】\n画面上で2つのノードがハイライトされます。この2つのノード間を、最短経路で移動するときに通るエッジの本数が2か、それとも3以上かを判定してください。「エッジ2本」または「エッジ3本以上」のボタンをクリックして回答してください。\n\n【実験の流れ】\n1. まず練習問題を2問行います。練習では解答後に正解が表示されます。\n2. 練習が終わったら、本番問題を12問行います。\n\n【表示方法について】\nグラフは様々な表示方法で提示されます：\n・2D表示（平面表示）\n・3D表示（固定視点）\n・3D表示（小さい回転）\n・3D表示（大きい回転）\n\n各問題で異なる表示方法が使われます。',
  instructionTaskB: 'これから共通隣接ノードを選択するタスクを行います。\n\n【ノードリンク図について】\nこの実験では「ノードリンク図」を使います。ノードリンク図は以下の要素でできています：\n・ノード（点）：丸い点で表されます\n・エッジ（線）：2つのノードを結ぶエッジです\n・隣接：あるノードと別のノードが、直接1本のエッジでつながっているとき、それらのノードは「隣接している」といいます\n\n【タスクの内容】\n画面上で2つのノードがハイライトされます。この2つのノードの両方に隣接しているノードをすべて選択してください。ノードをクリックして選択し、すべて選択したら「次へ進む」をクリックしてください。\n\n【実験の流れ】\n1. まず練習問題を2問行います。練習では解答後に正解が表示されます。\n2. 練習が終わったら、本番問題を12問行います。\n\n【表示方法について】\nグラフは様々な表示方法で提示されます：\n・2D表示（平面表示）\n・3D表示（固定視点）\n・3D表示（小さい回転）\n・3D表示（大きい回転）\n\n各問題で異なる表示方法が使われます。',
  readyToStart: '準備ができたら「次へ」をクリックして練習を開始してください。',
  
  // Practice
  practiceTitle: '練習',
  correctAnswer: '正解',
  incorrect: '不正解',
  correct: '正解',
  yourAnswer: 'あなたの答え',
  practiceContinue: '次へ',
  proceedToMain: '本番に進む',
  
  // Consent form
  consentTitle: '研究および実験についての説明',
  consentIntroduction: 'この度は「グラフの3Dレイアウトと奥行き知覚補助による可読性の向上」の実験にご関心をお持ちいただきありがとうございます。本ページの説明をお読みいただき、本調査にご協力いただける方は「同意する」ボタンを押してください。',
  consentSection1Title: '概要',
  consentSection1Content: '・ 研究の目的：視覚的表現（ノードリンク図）の新規設計・改善によりデータの有効活用を促進するための知見を収集します。\n・ 実験の目的：異なる表示方法（2D表示、3D表示、回転の有無など）によるノードリンク図の可読性への影響を検証します。\n・ 実験の方法：画面に表示されたノードリンク図（点と線で構成される図形）を見て、最短経路の距離判定や共通隣接ノードの選択などのタスクに答えてもらいます。表示方法は2D表示、3D表示（固定視点）、3D表示（小さい回転）、3D表示（大きい回転）など様々な条件で提示されます。\n・ 対象の実験参加者：18歳以上の方を対象としています。\n・ 研究期間：本研究は2027年3月31日までの実施を予定しています。',
  consentSection2Title: '実験への参加について',
  consentSection2Content: '・ 実験への参加は任意です。\n・ 実験への参加は無償です。\n・ 実験への参加に同意しないことで不利益を受けることはありません。\n・ 実験への参加に同意した後であっても、不利益を被ることなく、いつでも実験への参加を中止できます。中止の際にはブラウザあるいはタブを閉じてください。\n・ 実験には参加者のPCを利用してもらいます。',
  consentSection3Title: '安全性、個人情報保護、データ管理について',
  consentSection3Content: '・ ノードリンク図を見てもらう実験であるため、長時間続けると目が疲労する場合があります。問題と問題の合間に適宜休憩を挟んでください。\n・ ノードリンク図には3D回転表示を含むものがあります。画面の回転により、まれにめまいや不快感を感じる場合があります。心配な場合には実験への参加を中止してください。\n・ この実験によって収集するデータは、日時（タイムスタンプ）、表示内容を識別するID、作業毎の参加者の回答（正誤、反応時間、クリック数）、アンケートの回答（明確さ、疲労感）です。\n・ この実験によって、個人情報（氏名、性別、住所、電話番号、メールアドレス、IPアドレス等）は収集しません。\n・ 本調査より得られたデータの分析結果は、学会発表や学術論文を通じて公表されますが、情報はすべて統計的に処理されますので、個人が特定されることはありません。\n・ 本調査を通じて得られたデータは筑波大学の規定に従い成果公表後10年間保存されます。',
  consentSection4Title: '連絡先等',
  consentSection4Content: '・ 実施分担者 佐藤充（所属：筑波大学 Email: sato@vislab.cs.tsukuba.ac.jp）\n・ 実施責任者 三末和男（所属：筑波大学システム情報系 Email: misue@cs.tsukuba.ac.jp）\n・ 事務担当者 筑波大学 システム情報系 研究倫理委員会 事務局（システム情報エリア支援室 TEL:029-853-4989）',
  consentAgree: '同意する',
  consentDisagree: '同意しない',
  consentDisagreeMessage: '同意いただけない場合、実験を続行することができません。',
  
  // Consent form left panel
  consentExperimentFlow: '実験の流れ',
  consentFlowStep1: '同意書の確認と同意',
  consentFlowStep2: '参加者IDの入力',
  consentFlowStep3: 'タスクAの説明',
  consentFlowStep4: 'タスクAの練習（2問）',
  consentFlowStep5: 'タスクAの本番（12問）',
  consentFlowStep6: 'タスクAについてのアンケート',
  consentFlowStep7: 'タスクBの説明',
  consentFlowStep8: 'タスクBの練習（2問）',
  consentFlowStep9: 'タスクBの本番（12問）',
  consentFlowStep10: 'タスクBについてのアンケート',
  consentEstimatedTime: '所要時間',
  consentTimeValue: '約30分',
  consentImportantNotes: '実験を行うにあたってのお願い',
  consentNote1: 'ブラウザをフルスクリーンにして実験を行ってください',
  consentNote2: '同意書の内容をよくお読みください',
  consentNote3: '同意される方は「同意する」ボタンを押してください',
  consentNote4: 'ページをリロードしないでください',
};

