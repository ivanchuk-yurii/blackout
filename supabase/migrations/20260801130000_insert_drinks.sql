-- Beers
insert into
  public.drinks (name, category, abv, calories)
values
  -- Mainstream lagers
  ('Carling', 'beer', 3.4, 33),
  ('Foster''s', 'beer', 3.4, 33),
  ('Coors', 'beer', 3.4, 33),
  ('Carlsberg Danish Pilsner', 'beer', 3.8, 35),
  ('Stella Artois', 'beer', 4.6, 39),
  ('Budweiser', 'beer', 4.5, 41),
  ('Bud Light', 'beer', 3.5, 29),
  ('Heineken', 'beer', 5.0, 42),
  ('Amstel', 'beer', 4.1, 35),
  ('Kronenbourg 1664', 'beer', 5.0, 44),
  -- Premium / world lagers
  ('Peroni Nastro Azzurro', 'beer', 5.1, 42),
  ('Birra Moretti', 'beer', 4.6, 41),
  ('Madri Excepcional', 'beer', 4.6, 40),
  ('San Miguel', 'beer', 5.0, 43),
  ('Corona Extra', 'beer', 4.5, 42),
  ('Estrella Damm', 'beer', 4.6, 42),
  ('Asahi Super Dry', 'beer', 5.0, 42),
  ('Cobra', 'beer', 4.5, 40),
  -- Ales & stouts
  ('Guinness Draught', 'beer', 4.2, 37),
  ('John Smith''s Extra Smooth', 'beer', 3.6, 30),
  ('Boddingtons', 'beer', 3.5, 30),
  ('Doom Bar', 'beer', 4.0, 38),
  ('London Pride', 'beer', 4.1, 40),
  ('Old Speckled Hen', 'beer', 4.8, 44),
  ('Hobgoblin', 'beer', 5.2, 47),
  ('Timothy Taylor Landlord', 'beer', 4.3, 39),
  ('Newcastle Brown Ale', 'beer', 4.7, 43),
  ('Abbot Ale', 'beer', 5.0, 48),
  -- Craft
  ('BrewDog Punk IPA', 'beer', 5.4, 50),
  ('Beavertown Neck Oil', 'beer', 4.3, 42),
  ('Camden Hells', 'beer', 4.6, 40);

-- Ciders
insert into
  public.drinks (name, category, abv, calories)
values
  ('Strongbow Original', 'cider', 4.5, 37),
  ('Bulmers Original', 'cider', 4.5, 38),
  ('Magners Original', 'cider', 4.5, 45),
  ('Thatchers Gold', 'cider', 4.8, 47),
  ('Kopparberg', 'cider', 4.0, 51),
  ('Rekorderlig', 'cider', 4.0, 53),
  ('Aspall', 'cider', 5.5, 50),
  ('Old Mout', 'cider', 4.0, 50),
  ('Stowford Press', 'cider', 4.5, 41),
  ('Frosty Jack''s', 'cider', 7.5, 58),
  ('Henry Westons Vintage', 'cider', 8.2, 64);

-- Wines
insert into
  public.drinks (name, category, abv, calories)
values
  -- Red wines
  ('Malbec', 'wine', 14.0, 88),
  ('Cabernet Sauvignon', 'wine', 13.5, 86),
  ('Merlot', 'wine', 13.5, 85),
  ('Shiraz', 'wine', 14.0, 88),
  ('Pinot Noir', 'wine', 13.0, 83),
  ('Rioja', 'wine', 13.5, 85),
  ('Chianti', 'wine', 13.0, 80),
  -- White wines
  ('Sauvignon Blanc', 'wine', 12.5, 75),
  ('Chardonnay', 'wine', 13.0, 80),
  ('Pinot Grigio', 'wine', 12.0, 72),
  ('Riesling', 'wine', 11.0, 75),
  ('Chenin Blanc', 'wine', 12.5, 74),
  -- Rosé wines
  ('White Zinfandel', 'wine', 10.0, 80),
  ('Pinot Grigio Rosé', 'wine', 11.5, 74),
  ('Provence Rosé', 'wine', 13.0, 72),
  -- Sparkling wines
  ('Prosecco', 'wine', 11.0, 74),
  ('Champagne', 'wine', 12.0, 76),
  ('Cava', 'wine', 11.5, 73),
  -- Sweet & fortified wines
  ('Moscato', 'wine', 7.0, 80),
  ('Sauternes', 'wine', 13.5, 160),
  ('Port', 'wine', 20.0, 155),
  ('Sherry', 'wine', 15.0, 115),
  ('Madeira', 'wine', 19.0, 140);

-- Cocktails
insert into
  public.drinks (name, category, abv, calories, volume)
values
  ('Espresso Martini', 'cocktail', 20.0, 160, 120),
  ('Pornstar Martini', 'cocktail', 15.0, 150, 125),
  ('Aperol Spritz', 'cocktail', 9.7, 90, 200),
  ('Negroni', 'cocktail', 24.0, 150, 90),
  ('Margarita', 'cocktail', 22.0, 165, 140),
  ('Mojito', 'cocktail', 12.0, 120, 220),
  ('Cosmopolitan', 'cocktail', 20.0, 145, 120),
  ('Piña Colada', 'cocktail', 12.0, 200, 240),
  ('Old Fashioned', 'cocktail', 32.0, 140, 90),
  ('Daiquiri', 'cocktail', 22.0, 130, 120),
  (
    'Long Island Iced Tea',
    'cocktail',
    22.0,
    160,
    250
  ),
  ('Mai Tai', 'cocktail', 20.0, 150, 200),
  ('Whiskey Sour', 'cocktail', 20.0, 130, 120),
  ('Bloody Mary', 'cocktail', 12.0, 55, 200),
  ('Manhattan', 'cocktail', 30.0, 155, 90),
  ('Sex on the Beach', 'cocktail', 11.0, 90, 200);

-- Spirits
insert into
  public.drinks (name, category, abv, calories)
values
  ('Vodka', 'spirit', 37.5, 207),
  ('Gin', 'spirit', 37.5, 207),
  ('Rum', 'spirit', 35.0, 240),
  ('Whiskey', 'spirit', 40.0, 222),
  ('Tequila', 'spirit', 38.0, 213),
  ('Brandy', 'spirit', 40.0, 222),
  ('Chacha', 'spirit', 45.0, 250),
  ('Moonshine', 'spirit', 50.0, 276),
  ('Baileys', 'spirit', 17.0, 325),
  ('Jägermeister', 'spirit', 35.0, 150),
  ('Sambuca', 'spirit', 38.0, 315);
