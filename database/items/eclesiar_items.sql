create table[dbo].[eclesiar_items]( 
   [id] int NOT NULL, 
   [name] nvarchar(50) NOT NULL, 
   [quality] tinyint NOT NULL, 
   [weight] tinyint NOT NULL, 
   [negotiable] bit NOT NULL, 
   [type] nvarchar(50) NOT NULL, 
   [avatar] nvarchar(100) NOT NULL, 
   constraint [PK_eclesiar_items] primary key clustered([id] asc) 
); 
go 
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (1,'Grain',0,1,1,'CEREAL','https://storage.eclesiar.com/medias/25.png?v=b2ae775a4952cbe6e286d8af65d8d162');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (2,'Food',1,3,1,'FOOD','https://storage.eclesiar.com/medias/24.png?v=40a0dd99db4013221304133eba6b7748');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (3,'Food',2,3,1,'FOOD','https://storage.eclesiar.com/medias/23.png?v=07bcd164bf7652f6204b7120d17a3d5d');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (4,'Food',3,3,1,'FOOD','https://storage.eclesiar.com/medias/22.png?v=fd71439dc35b539fcd5b3594cbeeed87');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (5,'Food',4,3,1,'FOOD','https://storage.eclesiar.com/medias/21.png?v=6904b725692139a87038f86510246294');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (6,'Food',5,3,1,'FOOD','https://storage.eclesiar.com/medias/20.png?v=947f42af1e15eacba7ac7e2f1336b13c');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (7,'Iron',0,1,1,'MATERIALS','https://storage.eclesiar.com/medias/19.png?v=18c1545b2c5dfcc8fdc482e715ec3f6f');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (8,'Weapon',1,2,1,'WEAPONS','https://storage.eclesiar.com/medias/18.png?v=85204a1bec3e95eb3bf98c95f06436ea');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (9,'Weapon',2,2,1,'WEAPONS','https://storage.eclesiar.com/medias/17.png?v=ddada0bf129e44f2426ce9c50ac6f33a');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (10,'Weapon',3,2,1,'WEAPONS','https://storage.eclesiar.com/medias/16.png?v=5a81978182d85b6629545617f92bd441');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (11,'Weapon',4,2,1,'WEAPONS','https://storage.eclesiar.com/medias/15.png?v=58ff86439c36ec8b75cc514d5f3901d3');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (12,'Weapon',5,2,1,'WEAPONS','https://storage.eclesiar.com/medias/14.png?v=ed6bd607497157a991e5a1315ad9191f');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (13,'Fuel',0,1,1,'DIAMONDS','https://storage.eclesiar.com/medias/13.png?v=48af9d3ff04beeeb877c8074470f911c');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (14,'Airplane ticket',1,4,1,'TICKETS','https://storage.eclesiar.com/medias/12.png?v=2bff60611b61f39842c60677e525bc9a');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (15,'Airplane ticket',2,4,1,'TICKETS','https://storage.eclesiar.com/medias/11.png?v=18e085a7a8f9995bc615b9d72b4b57e4');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (16,'Airplane ticket',3,4,1,'TICKETS','https://storage.eclesiar.com/medias/10.png?v=b9aaf77c82a6d5a07e2c9045d7748b31');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (17,'Airplane ticket',4,4,1,'TICKETS','https://storage.eclesiar.com/medias/9.png?v=99c480079a84107c4f89f2ee964e77da');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (18,'Airplane ticket',5,4,1,'TICKETS','https://storage.eclesiar.com/medias/8.png?v=4d980cc2f904f32f4645e55e51dab20e');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (19,'Titanium',0,1,1,'AIRMATERIALS','https://storage.eclesiar.com/medias/7.png?v=57bea34d4c4a719a55243900f1a72a69');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (20,'Aircraft',1,4,1,'AIRWEAPONS','https://storage.eclesiar.com/medias/2.png?v=3fbda54a51e3110c6616eb6d4deb9a9b');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (21,'Aircraft',2,4,1,'AIRWEAPONS','https://storage.eclesiar.com/medias/3.png?v=764e91e31e8d5542b81f62513d165ac1');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (22,'Aircraft',3,4,1,'AIRWEAPONS','https://storage.eclesiar.com/medias/4.png?v=e35cffaa4ffa447702be2934b9a66053');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (23,'Aircraft',4,4,1,'AIRWEAPONS','https://storage.eclesiar.com/medias/5.png?v=58efedd023e67be89758b950baa27ab7');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (24,'Aircraft',5,4,1,'AIRWEAPONS','https://storage.eclesiar.com/medias/6.png?v=5ac137b2a5a3b27c200604bd5958e0f1');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (25,'Bunker',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/26.png?v=480caa879a54b20ec9e1219d1d210349');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (26,'City map',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/27.png?v=35e8b1cf2bb3955cf048f457b396bc07');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (27,'Tank',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/28.png?v=4822edf58f71895449461ba9c5e74d6c');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (28,'Bomber',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/29.png?v=b895f4554220ee46cf850ea351fd47f5');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (29,'Steroids',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/30.png?v=8a07653357710675d79d790c89074be3');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (30,'Medic bag',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/31.png?v=6a6e68bc7dae85f2699d6262d574e0c3');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (31,'Adrenaline',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/32.png?v=c1b33b64f60fb4b7460abedbc8054798');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (32,'Focus',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/33.png?v=6bb997502ada6cf11867bd43d87d5db7');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (33,'Hammer',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/432.png?v=37dc8a46caff6288eef4be10441f75ef');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (34,'Coffee',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/3247.png?v=12b392881d7c93e3925cdb280714b243');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (35,'Protein bar',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/3248.png?v=aa6f749a7da59a9d5663777cf376a497');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (36,'Food',5,3,1,'FOOD','https://storage.eclesiar.com/medias/4835.png?v=cee933959723db9ed1b79fbe02406c11');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (37,'Airplane ticket',5,4,1,'TICKETS','https://storage.eclesiar.com/medias/4836.png?v=9d5c6e0a1f9d991f81ac9ab9b07acd80');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (38,'Aircraft',5,4,1,'AIRWEAPONS','https://storage.eclesiar.com/medias/4837.png?v=2e8e2f49852b77658b0dc003674d6455');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (39,'Weapon',5,2,1,'WEAPONS','https://storage.eclesiar.com/medias/4838.png?v=aae21245eaf210eb230cdfca2087bce7');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (40,'Relocation Permit',3,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/6190.png?v=ab53965d7ab332548237b9bc584ccd31');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (41,'Relocation Permit',4,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/6191.png?v=0526eb3175de2407d4624299563a9e4f');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (42,'Relocation Permit',5,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/6192.png?v=7fa7433b01fd7e30ca3db7bef48b2e3b');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (43,'Megaphone',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/7497.png?v=f709bba127287edf03572f7ef6e4e344');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (44,'Ear plugs',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/7500.png?v=ece88383f46abf9e2644e4c283150294');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (45,'Merge Office',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/7644.png?v=6d6783a79515fec4df15f30e0af19080');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (46,'Military Strategy Manual',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/8270.png?v=f00145a8e3390bab08fea46659b72781');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (47,'Advanced Engineering Kit',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/8269.png?v=710db510746982cd647db3910b2042b9');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (48,'Medic bag',0,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/8268.png?v=5d3259f72b353af7c9e2ba5c63815117');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (49,'Adrenaline',0,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/8267.png?v=e775f8b8c7319abd69168e03f623e5cd');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (50,'Redbull',0,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/placeholder_item.png');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (51,'Protein Shake',0,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/placeholder_item.png');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (52,'Tactical Rucksack',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/11306.png?v=b92535686d4d56ec478b35ec925b6d42');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (53,'Notepad',0,0,1,'CONSUMABLE','https://storage.eclesiar.com/medias/17356.png?v=741cdd999b7232f2e1d030faf1dbacbd');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (54,'Notepad',0,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/19923.png?v=4d4035de7be67d039cec3fc0c2fc136f');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (55,'Military Strategy Manual',0,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/19767.png?v=3ae74780c2444fa551a49bf2db78e699');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (56,'Advanced Engineering Kit',0,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/19766.png?v=2a6f3d3c07d1d1058f461677b6772f64');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (57,'Coffee',0,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/19194.png?v=928eb5ab39d00214584485d3a318d1a8');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (58,'Protein bar',0,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/19193.png?v=f3c4389db0f66aa3826886d2bd644eeb');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (59,'Tank',0,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/19847.png?v=6c87f81ac365ddf3276735aeceb500c7');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (60,'Hammer',0,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/19846.png?v=874d39cfc5a4f3537da20338dbd9d7b6');
insert into [dbo].[eclesiar_items] ([id],[name],[quality],[weight],[negotiable],[type],[avatar]) values (61,'Relocation Permit',3,0,0,'CONSUMABLE','https://storage.eclesiar.com/medias/19845.png?v=99cb577ccffdbc97425eee1c0d401d8b');
go
