@echo off
call .env.cmd
rem --------------------------------------------------------------------------------------------
rem .data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[equipments] (\($k | join(","))) values (\($v | @csv ));"
echo create table [dbo].[equipments]( > %ECLESIAR_EQUIPMENTS%.sql
echo    [id] int NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [slot] int NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [grade] int NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [critical_chance] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [critical_hit] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [damage_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [true_damage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [flatland_damage_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [mountains_damage_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [forest_damage_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [desert_damage_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [accuracy] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [drop_chance] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [construction_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [hospital_construction_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [militarybase_construction_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [productionfields_construction_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [industrialzone_construction_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [construction_item_donation_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [mining_gold_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [construction_energy_reduction_percentage] numeric(18,2) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [avatar] nvarchar(100) NOT NULL, >> %ECLESIAR_EQUIPMENTS%.sql
echo    [drop_category] nvarchar(50) NOT NULL >> %ECLESIAR_EQUIPMENTS%.sql
echo    constraint [PK_%ECLESIAR_EQUIPMENTS%] primary key clustered([id] asc) >> %ECLESIAR_EQUIPMENTS%.sql
echo ); >> %ECLESIAR_EQUIPMENTS%.sql
echo go >> %ECLESIAR_EQUIPMENTS%.sql

@rem Powershell
rem curl --location "https://api.eclesiar.com/server/equipments?page=1" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=2" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=3" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=4" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=5" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=6" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=7" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=8" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=9" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=10" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=11" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=12" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=13" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=14" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=15" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=16" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=17" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=18" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=19" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=20" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=21" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=22" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=23" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=24" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=25" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql
rem curl --location "https://api.eclesiar.com/server/equipments?page=26" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[eclesiar_equipments] (\($k | join(","))) values (\($v | @csv ));"' >> eclesiar_equipments.sql

@rem Command-line
curl --location "https://api.eclesiar.com/server/equipments?page=1" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=2" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=3" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=4" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=5" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=6" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=7" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=8" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=9" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=10" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=11" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=12" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=13" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=14" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=15" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=16" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=17" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=18" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=19" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=20" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=21" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=22" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=23" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=24" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=25" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
curl --location "https://api.eclesiar.com/server/equipments?page=26" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_EQUIPMENTS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_EQUIPMENTS%.sql
echo go >> %ECLESIAR_EQUIPMENTS%.sql
rem Replace " to '
rem --------------------------------------------------------------------------------------------
rem .data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[items] (\($k | join(","))) values (\($v | @csv ));"
echo create table[dbo].[%ECLESIAR_ITEMS%]( > %ECLESIAR_ITEMS%.sql
echo    [id] int NOT NULL, >> %ECLESIAR_ITEMS%.sql
echo    [name] nvarchar(50) NOT NULL, >> %ECLESIAR_ITEMS%.sql
echo    [quality] tinyint NOT NULL, >> %ECLESIAR_ITEMS%.sql
echo    [weight] tinyint NOT NULL, >> %ECLESIAR_ITEMS%.sql
echo    [negotiable] bit NOT NULL, >> %ECLESIAR_ITEMS%.sql
echo    [type] nvarchar(50) NOT NULL, >> %ECLESIAR_ITEMS%.sql
echo    [avatar] nvarchar(100) NOT NULL, >> %ECLESIAR_ITEMS%.sql
echo    constraint [PK_%ECLESIAR_ITEMS%] primary key clustered([id] asc) >> %ECLESIAR_ITEMS%.sql
echo ); >> %ECLESIAR_ITEMS%.sql
echo go >> %ECLESIAR_ITEMS%.sql

@rem Powershell
rem curl --location "https://api.eclesiar.com/server/items?page=1" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[items] (\($k | join(","))) values (\($v | @csv ));"' >> items.sql
rem curl --location "https://api.eclesiar.com/server/items?page=2" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[items] (\($k | join(","))) values (\($v | @csv ));"' >> items.sql
rem curl --location "https://api.eclesiar.com/server/items?page=3" --header "Authorization: %ECLESIAR_API_KEY%" | ./jq -r '.data[] | to_entries | map("["+.key+"]") as $k | map(.value) as $v | "insert into [dbo].[items] (\($k | join(","))) values (\($v | @csv ));"' >> items.sql

@rem Command-line
curl --location "https://api.eclesiar.com/server/items?page=1" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_ITEMS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_ITEMS%.sql
curl --location "https://api.eclesiar.com/server/items?page=2" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_ITEMS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_ITEMS%.sql
curl --location "https://api.eclesiar.com/server/items?page=3" --header "Authorization: %ECLESIAR_API_KEY%" | jq -r ".data[] | to_entries | map(""[""+.key+""]"") as $k | map(.value) as $v | ""insert into [dbo].[%ECLESIAR_ITEMS%] (\($k | join("",""))) values (\($v | @csv ));""" >> %ECLESIAR_ITEMS%.sql
echo go >> %ECLESIAR_ITEMS%.sql
rem Replace " to '
rem Replace ,true, to ,1,
rem Replace ,false, to ,0,
rem Replace NEWLINE" to "
