const settings = (state = {}, action) => {
  switch (action.type) {
    case 'CLEAR_CURRENT_FILEID':
      return { ...state, currentFileId: undefined };
    case 'SET_EMAIL_ADDRESS':
      return { ...state, emailAddress: action.emailAddress };
    case 'SET_CURRENT_FILEID':
      return { ...state, currentFileId: action.fileId };
    case 'SET_CURRENT_SHEETID':
      return { ...state, currentSheetId: action.currentSheetId };
    case 'SET_DEFAULT_THUMB_COUNT':
      return { ...state, defaultThumbCount: action.defaultThumbCount };
    case 'SET_DEFAULT_COLUMN_COUNT':
      return { ...state, defaultColumnCount: action.defaultColumnCount };
    case 'SET_DEFAULT_THUMBNAIL_SCALE':
      return { ...state, defaultThumbnailScale: action.defaultThumbnailScale };
    case 'SET_DEFAULT_MOVIEPRINT_WIDTH':
      return { ...state, defaultMoviePrintWidth: action.defaultMoviePrintWidth };
    case 'SET_DEFAULT_MARGIN':
      return { ...state, defaultMarginRatio: action.defaultMarginRatio };
    case 'SET_DEFAULT_SHOW_HEADER':
      return { ...state, defaultShowHeader: action.defaultShowHeader };
    case 'SET_DEFAULT_SHOW_IMAGES':
      return { ...state, defaultShowImages: action.defaultShowImages };
    case 'SET_DEFAULT_PATH_IN_HEADER':
      return { ...state, defaultShowPathInHeader: action.defaultShowPathInHeader };
    case 'SET_DEFAULT_DETAILS_IN_HEADER':
      return { ...state, defaultShowDetailsInHeader: action.defaultShowDetailsInHeader };
    case 'SET_DEFAULT_TIMELINE_IN_HEADER':
      return { ...state, defaultShowTimelineInHeader: action.defaultShowTimelineInHeader };
    case 'SET_DEFAULT_ROUNDED_CORNERS':
      return { ...state, defaultRoundedCorners: action.defaultRoundedCorners };
    case 'SET_DEFAULT_THUMB_INFO':
      return { ...state, defaultThumbInfo: action.defaultThumbInfo };
    case 'SET_DEFAULT_OUTPUT_PATH':
      return { ...state, defaultOutputPath: action.defaultOutputPath };
    case 'SET_DEFAULT_OUTPUT_FORMAT':
      return { ...state, defaultOutputFormat: action.defaultOutputFormat };
    case 'SET_DEFAULT_OUTPUT_JPG_QUALITY':
      return { ...state, defaultOutputJpgQuality: action.defaultOutputJpgQuality };
    case 'SET_DEFAULT_THUMB_FORMAT':
      return { ...state, defaultThumbFormat: action.defaultThumbFormat };
    case 'SET_DEFAULT_THUMB_JPG_QUALITY':
      return { ...state, defaultThumbJpgQuality: action.defaultThumbJpgQuality };
    case 'SET_DEFAULT_CACHED_FRAMES_SIZE':
      return { ...state, defaultCachedFramesSize: action.defaultCachedFramesSize };
    case 'SET_DEFAULT_SAVE_OPTION_OVERWRITE':
      return { ...state, defaultSaveOptionOverwrite: action.defaultSaveOptionOverwrite };
    case 'SET_DEFAULT_SAVE_OPTION_INCLUDE_INDIVIDUAL':
      return {
        ...state,
        defaultSaveOptionIncludeIndividual: action.defaultSaveOptionIncludeIndividual,
      };
    case 'SET_DEFAULT_EMBED_FRAMENUMBERS':
      return { ...state, defaultEmbedFrameNumbers: action.defaultEmbedFrameNumbers };
    case 'SET_DEFAULT_EMBED_FILEPATH':
      return { ...state, defaultEmbedFilePath: action.defaultEmbedFilePath };
    case 'SET_DEFAULT_SHOW_PAPER_PREVIEW':
      return { ...state, defaultShowPaperPreview: action.defaultShowPaperPreview };
    case 'SET_DEFAULT_PAPER_ASPECT_RATIO_INV':
      return { ...state, defaultPaperAspectRatioInv: action.defaultPaperAspectRatioInv };
    case 'SET_DEFAULT_DETECT_INOUTPOINT':
      return { ...state, defaultDetectInOutPoint: action.defaultDetectInOutPoint };
    case 'SET_DEFAULT_SCENE_DETECTION_THRESHOLD':
      return { ...state, defaultSceneDetectionThreshold: action.defaultSceneDetectionThreshold };
    case 'SET_DEFAULT_TIMELINEVIEW_SECONDS_PER_ROW':
      return { ...state, defaultTimelineViewSecondsPerRow: action.defaultTimelineViewSecondsPerRow };
    case 'SET_DEFAULT_TIMELINEVIEW_MIN_DISPLAY_SCENE_LENGTH_IN_FRAMES':
      return {
        ...state,
        defaultTimelineViewMinDisplaySceneLengthInFrames: action.defaultTimelineViewMinDisplaySceneLengthInFrames,
      };
    case 'SET_DEFAULT_TIMELINEVIEW_PIXEL_PER_FRAME_RATIO':
      return { ...state, defaultTimelineViewWidthScale: action.defaultTimelineViewWidthScale };
    case 'SET_DEFAULT_TIMELINEVIEW_FLOW':
      return { ...state, defaultTimelineViewFlow: action.defaultTimelineViewFlow };
    case 'SET_DEFAULT_OUTPUT_PATH_FROM_MOVIE':
      return { ...state, defaultOutputPathFromMovie: action.defaultOutputPathFromMovie };
    case 'SET_DEFAULT_SHOT_DETECTION_METHOD':
      return { ...state, defaultShotDetectionMethod: action.defaultShotDetectionMethod };
    case 'SET_DEFAULT_MOVIEPRINT_BACKGROUND_COLOR':
      return { ...state, defaultMoviePrintBackgroundColor: action.defaultMoviePrintBackgroundColor };
    case 'SET_DEFAULT_FRAMEINFO_BACKGROUND_COLOR':
      return { ...state, defaultFrameinfoBackgroundColor: action.defaultFrameinfoBackgroundColor };
    case 'SET_DEFAULT_FRAMEINFO_COLOR':
      return { ...state, defaultFrameinfoColor: action.defaultFrameinfoColor };
    case 'SET_DEFAULT_FRAMEINFO_POSITION':
      return { ...state, defaultFrameinfoPosition: action.defaultFrameinfoPosition };
    case 'SET_DEFAULT_FRAMEINFO_SCALE':
      return { ...state, defaultFrameinfoScale: action.defaultFrameinfoScale };
    case 'SET_DEFAULT_FRAMEINFO_MARGIN':
      return { ...state, defaultFrameinfoMargin: action.defaultFrameinfoMargin };
    case 'SET_DEFAULT_MOVIEPRINT_NAME':
      return { ...state, defaultMoviePrintName: action.defaultMoviePrintName };
    case 'SET_DEFAULT_SINGLETHUMB_NAME':
      return { ...state, defaultSingleThumbName: action.defaultSingleThumbName };
    case 'SET_DEFAULT_ALLTHUMBS_NAME':
      return { ...state, defaultAllThumbsName: action.defaultAllThumbsName };
    case 'SET_DEFAULT_OPEN_FILE_EXPLORER_AFTER_SAVING':
      return { ...state, defaultOpenFileExplorerAfterSaving: action.defaultOpenFileExplorerAfterSaving };
    case 'SET_DEFAULT_FACE_SIZE_THRESHOLD':
      return { ...state, defaultFaceSizeThreshold: action.defaultFaceSizeThreshold };
    case 'SET_DEFAULT_FACE_CONFIDENCE_THRESHOLD':
      return { ...state, defaultFaceConfidenceThreshold: action.defaultFaceConfidenceThreshold };
    case 'SET_DEFAULT_FACE_UNIQUENESS_THRESHOLD':
      return { ...state, defaultFaceUniquenessThreshold: action.defaultFaceUniquenessThreshold };
    case 'SET_DEFAULT_SHOW_FACERECT':
      return { ...state, defaultShowFaceRect: action.defaultShowFaceRect };
    default:
      return state;
  }
};

export default settings;
