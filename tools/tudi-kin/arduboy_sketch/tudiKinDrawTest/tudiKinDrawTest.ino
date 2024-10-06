#include <Arduboy2.h>

Arduboy2 arduboy;

constexpr uint8_t frameRate = 40; // Frame rate in frames per second

constexpr int16_t tudiKin_w = 32;
constexpr int16_t tudiKin_h = 32;

void setup()
{
  arduboy.begin();
  arduboy.setFrameRate(frameRate);
  arduboy.initRandomSeed();
}

void loop()
{
  // pause render until it's time for the next frame
  if (!(arduboy.nextFrame()))
    return;
  
  arduboy.clear();

  drawTudiKin(arduboy.width()-(tudiKin_w+0), 0);

  arduboy.display();
}

void drawTudiKin(int16_t x, int16_t y)
{
  arduboy.drawRect(x, y, tudiKin_w, tudiKin_h, WHITE);

  arduboy.drawCircle(x+((tudiKin_w/2)-1), y+(tudiKin_h/2), (tudiKin_w/2)-1, WHITE);
}

