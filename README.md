# これは何？

2018/2 にはてなブログの引っ越しをした時のモロモロです。

* from: http://coderdojonagoya.hatenablog.com/
* to: http://coderdojo-nagoya.hateblo.jp/

# 移行記録

## 基本方針

* [whomeantan](http://blog.hatena.ne.jp/whomeantan/)氏の個人リソース依存になっていたのを[CoderDojoNagoya](http://profile.hatena.ne.jp/CoderDojoNagoya/)アカウント名義に移管する
* この先、新しいチャンピオンに運営が移される場合にはアカウントを移譲することが出来るようにしておく

## 移行手順

### 1. 旧はてブロからのエクスポート

`設定>詳細設定>エクスポート`

https://blog.hatena.ne.jp/whomeantan/coderdojonagoya.hatenablog.com/export/movable_type

ここからエクスポートすることにより、MovableType 形式のテキストファイルが得られる。

[こちらのファイル](coderdojonagoya.hatenablog.com.export)

### 2. 記事中に埋め込まれた画像の確保

MovableType 形式のエクスポートファイルはテキストしか含まれず、画像が次のような形で旧所有者のはてなフォトライフに残ってしまう。

```html
<img src="https://cdn-ak.f.st-hatena.com/images/fotolife/w/whomeantan/20170329/20170329115852.jpg" alt="f:id:whomeantan:20170329115852j:plain" title="f:id:whomeantan:20170329115852j:plain" class="hatena-fotolife" itemprop="image">
```

そのため、grep,sed コマンドで[画像 URL の一覧](img.txt)を抜き出し、

```shell-session
# 正確な正規表現は無くしました…こんな感じ
$ cat coderdojonagoya.hatenablog.com.export.txt | grep -E "^IMAGE.*whomeantan.*" | sed -E s/^.+\(http.+\)/\\1/ > img2.txt
```

それらの URL を cURL コマンドで全てローカルにダウンロードする。

```shell-session
$ mkdir img
$ cd img
$ cat ../img.txt|  xargs -n1 -P5 curl -LO
```

### 3. 画像ファイルを AWS S3 に配置

はてなフォトライフにはいい感じのアカウント間移行の手段が用意されていなかった。

* アップロードフォームがしょぼい（Flash を入れればいい感じのが出てくるらしいけど、2018 年で Flush って・・・）
* アップロードしたところで、埋め込み用の URL を生成する手段が面倒
  * https://www.aqua-exp.com/entry/picture-customize

ということで、[AWS S3 の Web ホスティング](https://docs.aws.amazon.com/ja_jp/AmazonS3/latest/dev/WebsiteHosting.html)を利用する。

#### S3 バケットの作成

下記で`s3://coder-dojo-nagoya-image`というバケットを作成。

```shell-session
$ cd dojo-img-s3
$ npm i
$ AWS_PROFILE=dojo npm start deploy
```

#### バケットに画像ファイルをアップロード

```shell-session
$ AWS_PROFILE=dojo aws s3 sync ./img/ s3://coder-dojo-nagoya-image/migrated/
```

これにて、

http://coder-dojo-nagoya-img.s3-website-ap-northeast-1.amazonaws.com/migrated/20170329135950.jpg

という URL で画像にアクセスできるようになる。

## 4. 新はてブロにインポート

### 画像 URL を置換

sed コマンドを使って、画像 URL を置換

https://github.com/coderdojo-nagoya/migration-201802/commit/8a2bd6bcb7e82356a3a34a533e074ce2cd73992a#diff-33eb15558fcacbfbea38aa398310e181

### インポート

置換されたファイルを新果てブロにインポート

https://blog.hatena.ne.jp/CoderDojoNagoya/coderdojo-nagoya.hateblo.jp/import

ここからインポート

### どうやら画像をはてなフォトライフに移行出来るっぽい

テキストファイルの移行が完了すると、画像のインポートメニューが出てきた。説明を読むに、

> > > 画像データの移行  
> > > インポートした記事には、次のような画像があります。  
> > > 移転元のブログを選んで「移行する」ボタンを押してください。  
> > > ※ブログに貼った他サイトの画像が表示されることもありますが、自分のブログの画像だけを移行してください。  
> > > ※Flickr や Instagram など一部の写真共有サービスや、はてなフォトライフ自身は移行の対象外です。  
> > > ※一度に移行できる合計サイズなどに制限があります（詳細はヘルプを参照してください）  
> > >  coder-dojo-nagoya-image.s3-website-ap-northeast-1.amazonaws.com

* はてなフォトライフ上のファイルは移行できないが、
* 別の画像サーバ上のファイルははてなフォトライフに移行できる

ということらしいので移行

10 分ほど待つと

```html
<img src="http://coder-dojo-nagoya-image.s3-website-ap-northeast-1.amazonaws.com/migrated/20170329115852.jpg" alt="f:id:whomeantan:20170329115852j:plain" title="f:id:whomeantan:20170329115852j:plain" class="hatena-fotolife" itemprop="image">
```

が、下記のように変わりました。

```html
<img src="https://cdn-ak.f.st-hatena.com/images/fotolife/C/CoderDojoNagoya/20180211/20180211154406.jpg" alt="f:id:whomeantan:20170329115852j:plain" title="f:id:whomeantan:20170329115852j:plain" class="hatena-fotolife" itemprop="image">
```

### 結果的にフォトライフに移行できたので S3 バケットは役目を終えた

消しときました

```shell-session
$ aws s3 rb s3://coder-dojo-nagoya-image --force
```

## 失態

[こういうところ](https://github.com/coderdojo-nagoya/migration-201802/blob/master/coderdojonagoya.hatenablog.com.export.txt#L5298)を置換し忘れました。  
たぶんアイキャッチ画像だと思います。いずれ画像が 404 担ってしまうかもしれませんが、過去記事一覧のところだけなのですいませんが力尽き諦めました。
