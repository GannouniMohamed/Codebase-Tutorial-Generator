import { Flow } from './core/flow.js';
import { FetchRepo } from './nodes/fetch-repo.js';
import { IdentifyAbstractions } from './nodes/identify-abstractions.js';
import { AnalyzeRelationships } from './nodes/analyze-relationships.js';
import { OrderChapters } from './nodes/order-chapters.js';
import { WriteChapters } from './nodes/write-chapters.js';
import { CombineTutorial } from './nodes/combine-tutorial.js';

export function createTutorialFlow(): Flow {
  // Create nodes
  const fetchRepo = new FetchRepo();
  const identifyAbstractions = new IdentifyAbstractions();
  const analyzeRelationships = new AnalyzeRelationships();
  const orderChapters = new OrderChapters();
  const writeChapters = new WriteChapters();
  const combineTutorial = new CombineTutorial();

  // Connect nodes in sequence
  fetchRepo.connect(identifyAbstractions)
    .connect(analyzeRelationships)
    .connect(orderChapters)
    .connect(writeChapters)
    .connect(combineTutorial);

  // Create and return the flow
  return new Flow(fetchRepo);
} 