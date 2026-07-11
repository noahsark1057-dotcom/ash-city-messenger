# 灰街メッセンジャー グラフィック導入メモ

32x32pxのドット絵PNGをここへ置くと、Canvas描画を差し替えられます。
素材が未配置、または `graphics.js` の `enabled` が `false` の間は、従来のCanvas図形で描画されます。

## 使い方

1. `tiles/` と `sprites/` にPNGを配置します。
2. `graphics.js` の `enabled: false` を `enabled: true` に変更します。
3. ファイル名を変えたい場合は、`graphics.js` のパスだけ変更します。
4. ブラウザをハードリロードします。反映されない時はURL末尾に `?v=任意の数字` を付けてください。

## 背景・ビル用タイル

背景、道路、ビルは32pxグリッドに合わせて敷き詰めます。
タイルは継ぎ目が自然につながる絵にするときれいに見えます。

- `tiles/ground.png`: 地面
- `tiles/road.png`: 道路
- `tiles/road_alt.png`: 道路の差分タイル
- `tiles/building.png`: ビル本体
- `tiles/building_edge.png`: ビル外枠用。任意

ビルの配置サイズも32px単位に寄せてあります。
`building_edge.png` がある場合は、ビルの外周に重ねて描きます。

## スプライト

基本は32x32pxの透過PNG推奨です。
機体や大型イベントなどはゲーム内で少し大きく描画されますが、元絵は32px基準で作って問題ありません。

- `sprites/player_alpha.png`: ドローンα
- `sprites/player_beta.png`: ドローンβ
- `sprites/player_gamma.png`: ドローンγ
- `sprites/return_point.png`: 帰還地点
- `sprites/supply_drop.png`: 支援物資
- `sprites/material_box.png`: 資材箱
- `sprites/survivor_signal.png`: 生存者信号
- `sprites/upgrade_station.png`: 強化ステーション
- `sprites/pickup_normal.png`: 通常荷物
- `sprites/pickup_medical.png`: 医療品
- `sprites/pickup_data.png`: データ端末
- `sprites/pickup_fragile.png`: 壊れ物
- `sprites/pickup_cooling.png`: 冷却品
- `sprites/pickup_heavy.png`: 重量貨物
- `sprites/destination.png`: 配送先
- `sprites/projectile.png`: パルス弾
- `sprites/enemy_chaser.png`: 追跡妨害機
- `sprites/enemy_jammer.png`: ジャマー
- `sprites/enemy_recovery.png`: 回収妨害機
- `sprites/enemy_patrol.png`: 警備ドローン
- `sprites/enemy_hacker.png`: カーゴハッカー
- `sprites/boss_watcher.png`: 巨大監視ドローン

## 作る時の目安

- タイルは32x32pxで、上下左右が自然につながるように作ります。
- スプライトは背景を透過にします。
- プレイヤーと敵は「上向き」が基準です。ゲーム側で進行方向に回転します。
- 小物は中央に寄せ、外側に2〜4pxほど余白を残すと見やすいです。
- まずは `ground.png`、`road.png`、`building.png`、`player_alpha.png` の4枚から入れると確認しやすいです。
