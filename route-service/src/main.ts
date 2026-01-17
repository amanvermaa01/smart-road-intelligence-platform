import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { loadGraphAtStartup } from './bootstrap/loadGraph';
import { startHazardListener } from './services/hazardListener';

async function bootstrap() {
  await loadGraphAtStartup();
  
  // Potential background task
  startHazardListener().catch(err => console.error('[Bootstrap] HazardListener failed:', err));

  const app = await NestFactory.create(AppModule);

  app.enableCors(); // frontend access

  await app.listen(3001);
}
bootstrap();
