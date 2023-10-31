import { createApp } from './app';
import { environment } from './boundaries/environment';

createApp().then(({ server }) => server.listen(environment.port));
