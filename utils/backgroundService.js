import BackgroundFetch from 'react-native-background-fetch';

const BackgroundFetchHeadlessTask = async (event) => {
  console.log('[BackgroundFetch HeadlessTask] start: ', event.taskId);

  // TODO: Your background logic — scan downloads, classify, notify user
  // Example:
  // await scanDownloadsAndClassify();

  BackgroundFetch.finish(event.taskId);
};

BackgroundFetch.registerHeadlessTask(BackgroundFetchHeadlessTask);
