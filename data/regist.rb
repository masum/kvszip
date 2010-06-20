# -*- coding: utf-8 -*-
require 'rubygems'
require 'csv'
require 'nkf'
require 'kconv'
require 'cassandra'
$KCODE = 'UTF8'
include Cassandra::Constants

=begin

Cassandra vs MongoDB vs CouchDB vs TokyoCabinet

mongodb
 1,320,007件
bulk登録の方法
 普通に配列にして、insert するだけ
サーバー起動
 ./mongodb-osx-x86_64-1.4.2/bin/mongod --dbpath data/db01/
クライアント
 ~/mongodb/mongodb-osx-x86_64-1.4.2/bin/mongo
> db.address2.find({"key":"東京都あ"})
Cassandraemon
Akishin999の日記
=end
class Kvs
  #$csvname = "KEN_ALL.CSV"
  $csvname = "22SHIZUO.CSV"
  $limit = 0
  $bulk = []
  def initialize
  end

  def bulk(data)
  end

  def addBulk(k,l,v)
    data = {'key'=>k,'value'=>l,'display'=>v}
    $bulk << data
    if $bulk.length > $count then
      # $coll.insert($bulk)
      $kvssystem.bulk($bulk)
      $bulk.clear
    end
  end

  def addFunc_allPattern(k,l,v)
    ks=k.split(//)
    for i in 0..(ks.length-1)
      addBulk(ks[0..i].join(),l,v)
    end
  end

  # 最後の１字は登録しない版
  def addFunc_lastUnregist(k,l,v)
    ks=k.split(//)
    for i in 0..(ks.length-2)
      addBulk(ks[0..i].join(),l,v)
    end
  end

  # 頭に県名などをつける版
  def addFunc_addPrefix(base,k,l,v)
    ks=k.split(//)
    for i in 0..(ks.length-1)
      addBulk(base+ks[0..i].join(),l,v)
    end
  end

  # 頭に県名などをつけ、最後の１字を登録しない版
  def addFunc_addPrefix_lastUnregist(base,k,l,v)
    ks=k.split(//)
    for i in 0..(ks.length-2)
      addBulk(base+ks[0..i].join(),l,v)
    end
  end

  # そのまま登録版
  def addFunc_direct(k,l,v) 
    addBulk(k,l,v)
  end

  def start
    $total = 0
    $ken = nil
    $shi = nil
    CSV.open($csvname,"r") do |row|
      $total += 1
      adr = {}
      a = NKF.nkf('-SW -Lu -h', row[3])
      yken = NKF.nkf('-Sw -Lu -h', row[3])
      yshi = NKF.nkf('-Sw -Lu -h', row[4])
      ychi = NKF.nkf('-Sw -Lu -h', row[5])
      ychi = ychi.split('(')[0]
      kken = row[6].toutf8
      kshi = row[7].toutf8
      kchi = row[8].toutf8
      next unless kchi.scan(/以下に/).length==0 

      #puts $total if(($total % 10000)==0)
      if ($total > $limit)
        break
      end unless $limit==0


      # 地区名の処理
      addFunc_direct( (kken+ kshi), kchi, (kken+ kshi+ kchi) )
      addFunc_addPrefix( (kken+ kshi), ychi, kchi, (kken+ kshi+ kchi) )
      addFunc_addPrefix_lastUnregist( (kken+ kshi), kchi, kchi, (kken+ kshi+ kchi) )

      if ($shi != kshi) then # 新しい市に変わった
        $shi = kshi
        addFunc_direct(kken, kshi, (kken+ kshi) )
        addFunc_addPrefix(kken, yshi, kshi, (kken+  kshi))
        addFunc_addPrefix_lastUnregist(kken, kshi, kshi, (kken+ kshi))
      end

      if ($ken != kken) then # 新しい県に変わった
        $ken = kken
        addFunc_direct("*", kken, kken)
        addFunc_allPattern(yken, kken, kken)
        addFunc_lastUnregist(kken, kken, kken)
      end

    end
    if $bulk.length > 0 then
      # $coll.insert($bulk)
      $kvssystem.bulk($bulk)
    end
  end
end

class MongoZip < Kvs
  def initialize(data="KEN_ALL.CSV", dbname="address")
    require 'mongo'
    #$csvname = "22SHIZUO.CSV"
    $csvname = ""
    $limit = 0
    $count = 10000
    $dbname = "mydb"
    $collectionname = "address"
    $db = Mongo::Connection.new("localhost").db($dbname)
    $coll = $db.collection($collectionname)
    $coll.remove
  end
  def bulk(data)
    s = Time.now;
    $coll.insert(data)
    diff = Time.now - s;
    puts data.length.to_s + "/" +  diff.to_s;
  end
end

class CassandraZip < Kvs
  def initialize
    $csvname = "KEN_ALL.CSV"
    #$csvname = "22SHIZUO.CSV"
    $limit = 0
    $count = 10000
    $cassandra = Cassandra.new('Keyspace1')
  end

  def bulk(data)
    s = Time.now;
    $cassandra.batch do
      data.each do |row|
        $cassandra.insert(:Standard2, row['key'], row)
      end
    end
    diff = Time.now - s;
    puts data.length.to_s + "," +  diff.to_s;
  end
end

class CouchZip < Kvs
  def initialize
    require 'couchlib'
    $csvname = "KEN_ALL.CSV"
    #$csvname = "22SHIZUO.CSV"
    $limit = 0
    $count = 10000
    $dbname = "/a02"

    $couch = Couch::Server.new("localhost","5984")
    res = $couch.get($dbname)
    unless (res['error'] == nil) then
      p $couch.put($dbname,'')
    else
      p $couch.delete($dbname)
      p $couch.put($dbname,'')
    end

    design = Hash::new
    design = { 
      "_id"=>"_design/suggest",
      "language"=>"javascript",
      "views"=> { 
        "suggest"=>{ 
          "map"=>"function(doc) {
             emit(doc.key,{value:doc.value,display:doc.display});
          }",
        }
      }
    }
    db = $dbname + URI.escape("/_design/suggest")
    p $couch.put(db,design)

  end

  def bulk(data)
    bulk = Hash::new
    bulk["docs"] = data

    db = $dbname+"/_bulk_docs"
    db = URI.escape(db)

    s = Time.now;

    $couch.post(db,bulk)

    diff = Time.now - s;
    puts data.length.to_s + "," +  diff.to_s;
  end
end

db = "list"
if (db=="cassandra")
  $kvssystem = CassandraZip.new
  $kvssystem.start
end

if (db=="mongo")
  $kvssystem = MongoZip.new
  $kvssystem.start
end

if (db=="couch")
  $kvssystem = CouchZip.new
  $kvssystem.start
end

if (db=="list")
  $cassandra = Cassandra.new('Keyspace1')
  $cassandra.get_range(:Standard2).each do |obj|
    p "Key = #{obj.key}"
  end
end
