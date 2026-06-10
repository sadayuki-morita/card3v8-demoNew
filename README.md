# card3v8-demoNew

## 概要

- 3点式C-cardのアナライザを用いたデモページの集合。SDKを提供した顧客専用デモページは、含まない。
- アナライザの仕様が異なり、デモページによって使用するソースファイルが異なるので通医が必要。  
- 画像、音楽、動画コンテンツ以外のソースコードは、GitHubの同一リポジトリで管理する。
- デモページのディレクトリ構造はすべて同じ、デモページの種類別にHTMLが別々になっている。
- v8demo (最初の９枚セットのデモカード用ページ)以外は、ページ毎に１種類のカードのみで、v8demo を含め複数のIDカードを認証してURL遷移するデモ用Topページは存在しない。

## ディレクトリ構造

    card3v8_demoNew  
      - /medias  ：音楽、動画等をデモ仕様毎に格納、デモページ毎には別れておらず、フラット。Git管理しない。  
      - /img ：画像をデモ仕様毎に格納、デモページ毎には別れておらず、フラット。Git管理しない。  
      - /js  ：ID認証アナライザ、制御用javascript
          - /c：IDコードリストのソース
                cv8-10.js：ID10121,ID10123,ID10288,ID10307,ID10317,ID10367,ID10381,ID10482,ID10490,ID10492（9枚セットデモ用）
                cv8.js：ID10381（9枚セットデモ用以外のすべてのデモページで使用）
                cv83.js：ID10333（3点式C-Cardの白カード、この中のデモページでは未使用）
      - /css  ：（9枚セットデモ用、それ以外は、HTMLに直接記載）
      - /res/beeps：タッチ時の反応音、Git管理しない。
      - /old_and_an：旧バージョンとIDコード解析用HTML、Git管理しない。  
      - index.html  ：Topページ、サービスコードを入力して、各デモページのTopに遷移する  
      - .gitignore
      - README.md  

## デモページアクセス

  - Top (https://multi-touchcard.com/card3v8-demoNew/)  
      - SKSS社向け ('https://multi-touchcard.com/card3v8-demoNew/index-skss.html') /  サービスコード："skss" 
      - ベネッセ、DNP向け ('https://multi-touchcard.com/card3v8-demoNew/index-bns.html') /  サービスコード："bns"
      - 9枚セットデモページ ('https://multi-touchcard.com/card3v8-demoNew/index-v8demo.html') /  サービスコード："v8demo"
      - IML英語版名刺デモページ ('https://multi-touchcard.com/card3v8-demoNew/index-buscard-en.html') /  サービスコード："buscard" 
      - IML会社説明デモページ ('https://multi-touchcard.com/card3v8-demoNew/index-iml.html') /  サービスコード："iml"
      - Asue社向け/その1 ('https://multi-touchcard.com/card3v8-demoNew/index-asue.html') /  サービスコード："asue"
      - Asue社向け/その2 ('https://multi-touchcard.com/card3v8-demoNew/index-asue2.html') /  サービスコード："asue2"

    + cards1-demoNewで管理するデモページに遷移するもの
      - 会社紹介 (https://multi-touchcard.com/cards1-demoNew/pages/mtllc/index-mtllc.html)  /  サービスコード：mtllc  
      - 偕楽園観光 (https://multi-touchcard.com/cards1-demoNew/pages/mtllc/index-kairakuen.html)  /  サービスコード：kairakuen  
          - 上記2ページは、2点式C-Cardデモ用白カード、ID：S1-1757、S1-1436 用
      - ID-Checkページ (https://multi-touchcard.com/cards1-demoNew/pages/mtllc/index-idcheck.html)  /  サービスコード：idcheck   
      - 動物園動作判定ページ (https://multi-touchcard.com/cards1-demoNew/pages/zoo/index.html)  /  サービスコード：zoo  
          - 主にコースター、バッジ試作サンプルデモ用
      - 動物園タッチ方向判定ページ (https://multi-touchcard.com/cards1-demoNew/pages/zoo-rote/index.html)  /  サービスコード：zoorote  
          - 主にアクスタ、プレート試作サンプルデモ用
      - 音楽動画再生ページ (https://multi-touchcard.com/cards1-demoNew/pages/cassette/index.html)  /  サービスコード：cassette      
          - 主にカード、アクスタ、プレート試作サンプルデモ用
      - 鉄道図鑑ページ (https://multi-touchcard.com/cards1-demoNew/pages/train/index.html)  /  サービスコード：train 
          - 主にアクスタ、プレート試作サンプルデモ用
          - Topページで、3種類のサンプル（ID：S1-57、S1-107、S1-582）を認証してページ遷移、そのページでタッチ方向×動作判定の24種類の鉄道写真表示する
      - 鉄道図鑑ページ1 (https://multi-touchcard.com/cards1-demoNew/pages/train/index-all.html)  /  サービスコード：train1
          - 1ページで、3種類のサンプルIDを認証してタッチ方向×動作判定の3ID×24＝72種類の鉄道写真表示する
      - 鉄道図鑑ページ0 (https://multi-touchcard.com/cards1-demoNew/pages/train/index-all0.html)  /  サービスコード：train0    
          - 1ページで、3種類のサンプル（ID：S1-57、S1-107、S1-582）を認証しタッチ方向×動作判定の3ID×24＝72種類の鉄道写真表示する      

## デモページの基本的な使い方

  - デモページエントリ用のQRコードを読んで示されたURLをブラウザで表示すると、サービスコード入力画面が表示されるので入力欄に、上記サービスコードを入力して[OK]をタッチ。
  - タッチページに遷移すると、タッチ開始のアラート画面が表示され、[OK]をタッチすると、タッチページが表示さる。
  - 以降、C-cardサンプルをタッチすることで、対応するページに遷移。

## アナライザ動作仕様のパラメータおよび設定方法

- 認証IDを変更する場合、HTMLの先頭で
```
    <script>
	let srcIdFile="./js/c/filename.js";		//20260526 ディレクトリ構造見直し、IDコードファイルcv8.js以外の場合ここにファイル名を記載
    </script>
```
  を追記して、`./js/c/filename.js 'のファイルにBase64.encodeでエンコードしたIDの配列 CONFV8 を作成する。

- HTMLの先頭で、IDシリーズをしない場合、cv8.js：ID10381になる。


## アナライザバージョン

- analyze.js ver.1.0.0　20260526　
- cardv8.js ver.1.0.0　20260526
- ctrl.js ver.1.0.0　20260526
      
## 来歴

- 作成　PKB　
- アナライザソースファイル共用化のディレクトリ構造見直しとGitHub導入　20260520

