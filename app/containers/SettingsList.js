// @flow

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Slider, { Handle, createSliderWithTooltip } from 'rc-slider';
import Tooltip from 'rc-tooltip';
import { SketchPicker } from 'react-color';
import throttle from 'lodash/throttle';
import { Checkboard } from 'react-color/lib/components/common';
import {
  Accordion,
  Button,
  Icon,
  Label,
  Radio,
  Dropdown,
  Container,
  Statistic,
  Divider,
  Checkbox,
  Grid,
  List,
  Message,
  Popup,
  Input,
} from 'semantic-ui-react';
import styles from './Settings.css';
import stylesPop from '../components/Popup.css';
import { frameCountToMinutes, getCustomFileName, limitRange, sanitizeString, typeInTextarea } from '../utils/utils';
import {
  CACHED_FRAMES_SIZE_OPTIONS,
  COLOR_PALETTE_PICO_EIGHT,
  DEFAULT_ALLTHUMBS_NAME,
  DEFAULT_FRAMEINFO_BACKGROUND_COLOR,
  DEFAULT_FRAMEINFO_COLOR,
  DEFAULT_FRAMEINFO_MARGIN,
  DEFAULT_FRAMEINFO_POSITION,
  DEFAULT_FRAMEINFO_SCALE,
  DEFAULT_MOVIE_HEIGHT,
  DEFAULT_MOVIE_WIDTH,
  DEFAULT_MOVIEPRINT_BACKGROUND_COLOR,
  DEFAULT_MOVIEPRINT_NAME,
  DEFAULT_SHOW_FACERECT,
  DEFAULT_SINGLETHUMB_NAME,
  DEFAULT_OUTPUT_JPG_QUALITY,
  DEFAULT_THUMB_FORMAT,
  DEFAULT_THUMB_JPG_QUALITY,
  FACE_CONFIDENCE_THRESHOLD,
  FACE_SIZE_THRESHOLD,
  FACE_UNIQUENESS_THRESHOLD,
  FRAMEINFO_POSITION_OPTIONS,
  MENU_FOOTER_HEIGHT,
  MENU_HEADER_HEIGHT,
  MOVIEPRINT_WIDTH_HEIGHT,
  MOVIEPRINT_WIDTH_HEIGHT_SIZE_LIMIT,
  OUTPUT_FORMAT_OPTIONS,
  OUTPUT_FORMAT,
  PAPER_LAYOUT_OPTIONS,
  SHEET_TYPE,
  SHOT_DETECTION_METHOD_OPTIONS,
  THUMB_SELECTION,
} from '../utils/constants';
import getScaleValueObject from '../utils/getScaleValueObject';

const SliderWithTooltip = createSliderWithTooltip(Slider);

const handle = props => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip prefixCls="rc-slider-tooltip" overlay={value} visible placement="top" key={index}>
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

const getOutputSizeOptions = (
  baseSizeArray,
  file = {
    width: DEFAULT_MOVIE_WIDTH,
    height: DEFAULT_MOVIE_HEIGHT,
  },
  columnCountTemp,
  thumbCountTemp,
  settings,
  visibilitySettings,
  sceneArray,
  secondsPerRowTemp,
  isGridView,
) => {
  const newScaleValueObject = getScaleValueObject(
    file,
    settings,
    visibilitySettings,
    columnCountTemp,
    thumbCountTemp,
    4096,
    undefined,
    1,
    undefined,
    undefined,
    sceneArray,
    secondsPerRowTemp,
  );

  // set base size options
  const moviePrintSize = MOVIEPRINT_WIDTH_HEIGHT.map(item => {
    const otherDim = isGridView
      ? Math.round(item * newScaleValueObject.moviePrintAspectRatioInv)
      : Math.round(item / newScaleValueObject.timelineMoviePrintAspectRatioInv);
    return {
      value: item,
      otherdim: otherDim,
      text: isGridView ? `${item}px (×${otherDim}px)` : `${otherDim}px (×${item}px)`,
      'data-tid': `${item}-option`,
    };
  });

  // add max option
  if (
    isGridView
      ? newScaleValueObject.moviePrintAspectRatioInv > 1
      : newScaleValueObject.timelineMoviePrintAspectRatioInv < 1
  ) {
    const maxDim = isGridView
      ? Math.round(MOVIEPRINT_WIDTH_HEIGHT_SIZE_LIMIT / newScaleValueObject.moviePrintAspectRatioInv)
      : Math.round(MOVIEPRINT_WIDTH_HEIGHT_SIZE_LIMIT * newScaleValueObject.timelineMoviePrintAspectRatioInv);
    // to avoid duplicates due to rounding
    if (maxDim !== MOVIEPRINT_WIDTH_HEIGHT_SIZE_LIMIT) {
      moviePrintSize.push({
        value: maxDim,
        otherdim: MOVIEPRINT_WIDTH_HEIGHT_SIZE_LIMIT,
        text: isGridView
          ? `${maxDim}px (×${MOVIEPRINT_WIDTH_HEIGHT_SIZE_LIMIT}px)`
          : `${MOVIEPRINT_WIDTH_HEIGHT_SIZE_LIMIT}px (×${maxDim}px)`,
        'data-tid': `other-max-option`,
      });
    }
  }

  // filter options
  const moviePrintSizeArray = moviePrintSize.filter(item => {
    const useOtherDim = isGridView
      ? newScaleValueObject.moviePrintAspectRatioInv > 1
      : newScaleValueObject.timelineMoviePrintAspectRatioInv < 1;
    return useOtherDim
      ? item.otherdim <= MOVIEPRINT_WIDTH_HEIGHT_SIZE_LIMIT
      : item.value <= MOVIEPRINT_WIDTH_HEIGHT_SIZE_LIMIT;
  });
  // console.log(moviePrintSizeArray);
  return moviePrintSizeArray;
};

class SettingsList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      changeSceneCount: false,
      showSliders: true,
      displayColorPicker: {
        moviePrintBackgroundColor: false,
        frameninfoBackgroundColor: false,
        frameinfoColor: false,
      },
      previewMoviePrintName: DEFAULT_MOVIEPRINT_NAME,
      previewSingleThumbName: DEFAULT_SINGLETHUMB_NAME,
      previewAllThumbsName: DEFAULT_ALLTHUMBS_NAME,
      focusReference: undefined,
      activeIndex: -1,
    };

    this.onChangeDefaultMoviePrintNameThrottled = throttle(
      value => this.props.onChangeDefaultMoviePrintName(value),
      1000,
      { leading: false },
    );
    this.onChangeDefaultMoviePrintNameThrottled = this.onChangeDefaultMoviePrintNameThrottled.bind(this);
    this.onChangeDefaultSingleThumbNameThrottled = throttle(
      value => this.props.onChangeDefaultSingleThumbName(value),
      1000,
      { leading: false },
    );
    this.onChangeDefaultSingleThumbNameThrottled = this.onChangeDefaultSingleThumbNameThrottled.bind(this);
    this.onChangeDefaultAllThumbsNameThrottled = throttle(
      value => this.props.onChangeDefaultAllThumbsName(value),
      1000,
      { leading: false },
    );
    this.onChangeDefaultAllThumbsNameThrottled = this.onChangeDefaultAllThumbsNameThrottled.bind(this);

    // this.onToggleSliders = this.onToggleSliders.bind(this);
    this.onGetPreviewCustomFileName = this.onGetPreviewCustomFileName.bind(this);
    this.onShowSliders = this.onShowSliders.bind(this);
    this.onChangeSceneCount = this.onChangeSceneCount.bind(this);
    this.onChangePaperAspectRatio = this.onChangePaperAspectRatio.bind(this);
    this.onChangeShowPaperPreview = this.onChangeShowPaperPreview.bind(this);
    this.onChangeOutputPathFromMovie = this.onChangeOutputPathFromMovie.bind(this);
    this.onChangeTimelineViewFlow = this.onChangeTimelineViewFlow.bind(this);
    this.onChangeDetectInOutPoint = this.onChangeDetectInOutPoint.bind(this);
    this.onChangeReCapture = this.onChangeReCapture.bind(this);
    this.onChangeShowHeader = this.onChangeShowHeader.bind(this);
    this.onChangeShowPathInHeader = this.onChangeShowPathInHeader.bind(this);
    this.onChangeShowDetailsInHeader = this.onChangeShowDetailsInHeader.bind(this);
    this.onChangeShowTimelineInHeader = this.onChangeShowTimelineInHeader.bind(this);
    this.onChangeRoundedCorners = this.onChangeRoundedCorners.bind(this);
    this.onChangeShowHiddenThumbs = this.onChangeShowHiddenThumbs.bind(this);
    this.onChangeThumbInfo = this.onChangeThumbInfo.bind(this);
    this.onChangeOutputFormat = this.onChangeOutputFormat.bind(this);
    this.onChangeThumbFormat = this.onChangeThumbFormat.bind(this);
    this.onChangeFrameinfoPosition = this.onChangeFrameinfoPosition.bind(this);
    this.onChangeCachedFramesSize = this.onChangeCachedFramesSize.bind(this);
    this.onChangeOverwrite = this.onChangeOverwrite.bind(this);
    this.onChangeIncludeIndividual = this.onChangeIncludeIndividual.bind(this);
    this.onChangeEmbedFrameNumbers = this.onChangeEmbedFrameNumbers.bind(this);
    this.onChangeEmbedFilePath = this.onChangeEmbedFilePath.bind(this);
    this.onChangeOpenFileExplorerAfterSaving = this.onChangeOpenFileExplorerAfterSaving.bind(this);
    this.onChangeThumbnailScale = this.onChangeThumbnailScale.bind(this);
    this.onChangeMoviePrintWidth = this.onChangeMoviePrintWidth.bind(this);
    this.onChangeShotDetectionMethod = this.onChangeShotDetectionMethod.bind(this);
    this.onSubmitDefaultMoviePrintName = this.onSubmitDefaultMoviePrintName.bind(this);
    this.onSubmitDefaultSingleThumbName = this.onSubmitDefaultSingleThumbName.bind(this);
    this.setFocusReference = this.setFocusReference.bind(this);
    this.addAttributeIntoInput = this.addAttributeIntoInput.bind(this);
    this.onSubmitDefaultAllThumbsName = this.onSubmitDefaultAllThumbsName.bind(this);
    this.onChangeColumnCountViaInput = this.onChangeColumnCountViaInput.bind(this);
    this.onChangeColumnCountViaInputAndApply = this.onChangeColumnCountViaInputAndApply.bind(this);
    this.onChangeRowViaInput = this.onChangeRowViaInput.bind(this);
    this.onChangeTimelineViewSecondsPerRowViaInput = this.onChangeTimelineViewSecondsPerRowViaInput.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidUpdate(prevProps) {
    const { file, sheetName, settings } = this.props;
    if (
      file !== undefined &&
      prevProps.file !== undefined &&
      prevProps.file.name !== undefined &&
      file.name !== undefined
    ) {
      if (file.name !== prevProps.file.name || sheetName !== prevProps.sheetName) {
        const {
          defaultMoviePrintName = DEFAULT_MOVIEPRINT_NAME,
          defaultSingleThumbName = DEFAULT_SINGLETHUMB_NAME,
          defaultAllThumbsName = DEFAULT_ALLTHUMBS_NAME,
        } = settings;
        this.setState({
          previewMoviePrintName: this.onGetPreviewCustomFileName(defaultMoviePrintName),
          previewSingleThumbName: this.onGetPreviewCustomFileName(defaultSingleThumbName),
          previewAllThumbsName: this.onGetPreviewCustomFileName(defaultAllThumbsName),
        });
      }
    }
  }

  // onToggleSliders = () => {
  //   this.setState(state => ({
  //     showSliders: !state.showSliders
  //   }));
  // }

  handleClick = (e, titleProps) => {
    const { index } = titleProps;
    const { activeIndex } = this.state;
    const newIndex = activeIndex === index ? -1 : index;

    this.setState({ activeIndex: newIndex });
  };

  onGetPreviewCustomFileName = (customFileName, props = this.props) => {
    const { file, settings, sheetName } = props;
    const previewName = getCustomFileName(file !== undefined ? file.name : '', sheetName, `000000`, customFileName);
    return previewName;
  };

  onShowSliders = (e, { checked }) => {
    this.setState({
      showSliders: !checked,
    });
  };

  setFocusReference = e => {
    const ref = e.target;
    this.setState({
      focusReference: ref,
    });
  };

  addAttributeIntoInput = attribute => {
    const { focusReference } = this.state;
    if (focusReference !== undefined) {
      // console.log(focusReference);
      const newText = typeInTextarea(focusReference, attribute);
      const previewName = this.onGetPreviewCustomFileName(newText);
      switch (focusReference.name) {
        case 'defaultMoviePrintNameInput':
          this.setState({
            previewMoviePrintName: previewName,
          });
          break;
        case 'defaultSingleThumbNameInput':
          this.setState({
            previewSingleThumbName: previewName,
          });
          break;
        case 'defaultAllThumbsNameInput':
          this.setState({
            previewAllThumbsName: previewName,
          });
          break;
        default:
      }
    }
  };

  onSubmitDefaultMoviePrintName = e => {
    const value = sanitizeString(e.target.value);
    const previewMoviePrintName = this.onGetPreviewCustomFileName(value);
    this.setState({
      previewMoviePrintName,
    });
    this.onChangeDefaultMoviePrintNameThrottled(value);
  };

  onSubmitDefaultSingleThumbName = e => {
    const value = sanitizeString(e.target.value);
    const previewSingleThumbName = this.onGetPreviewCustomFileName(value);
    this.setState({
      previewSingleThumbName,
    });
    this.onChangeDefaultSingleThumbNameThrottled(value);
  };

  onSubmitDefaultAllThumbsName = e => {
    const value = sanitizeString(e.target.value);
    const previewAllThumbsName = this.onGetPreviewCustomFileName(value);
    this.setState({
      previewAllThumbsName,
    });
    this.onChangeDefaultAllThumbsNameThrottled(value);
  };

  onChangeColumnCountViaInput = e => {
    if (e.key === 'Enter') {
      const value = limitRange(Math.floor(e.target.value), 1, 100);
      this.props.onChangeColumn(value);
    }
  };

  onChangeColumnCountViaInputAndApply = e => {
    if (e.key === 'Enter') {
      const value = limitRange(Math.floor(e.target.value), 1, 100);
      this.props.onChangeColumnAndApply(value);
    }
  };

  onChangeRowViaInput = e => {
    if (e.key === 'Enter') {
      const value = limitRange(Math.floor(e.target.value), 1, 100);
      this.props.onChangeRow(value);
    }
  };

  onChangeTimelineViewSecondsPerRowViaInput = e => {
    if (e.key === 'Enter') {
      const value = limitRange(Math.floor(e.target.value), 1, 20000); // 1 second to 5 hours
      this.props.onChangeTimelineViewSecondsPerRow(value);
    }
  };

  onChangeSceneCount = (e, { checked }) => {
    this.setState({ changeSceneCount: checked });
  };

  onChangeTimelineViewFlow = (e, { checked }) => {
    this.props.onTimelineViewFlowClick(checked);
  };

  onChangeShowPaperPreview = (e, { checked }) => {
    this.props.onShowPaperPreviewClick(checked);
  };

  onChangeOutputPathFromMovie = (e, { checked }) => {
    this.props.onOutputPathFromMovieClick(checked);
  };

  onChangePaperAspectRatio = (e, { value }) => {
    this.props.onPaperAspectRatioClick(value);
  };

  onChangeDetectInOutPoint = (e, { checked }) => {
    this.props.onDetectInOutPointClick(checked);
  };

  onChangeReCapture = (e, { checked }) => {
    this.props.onReCaptureClick(checked);
  };

  onChangeShowHeader = (e, { checked }) => {
    this.props.onToggleHeaderClick(checked);
  };

  onChangeShowPathInHeader = (e, { checked }) => {
    this.props.onShowPathInHeaderClick(checked);
  };

  onChangeShowFaceRect = (e, { checked }) => {
    this.props.onChangeShowFaceRectClick(checked);
  };

  onChangeShowDetailsInHeader = (e, { checked }) => {
    this.props.onShowDetailsInHeaderClick(checked);
  };

  onChangeShowTimelineInHeader = (e, { checked }) => {
    this.props.onShowTimelineInHeaderClick(checked);
  };

  onChangeRoundedCorners = (e, { checked }) => {
    this.props.onRoundedCornersClick(checked);
  };

  onChangeShowHiddenThumbs = (e, { checked }) => {
    this.props.onShowHiddenThumbsClick(checked);
  };

  onChangeThumbInfo = (e, { value }) => {
    this.props.onThumbInfoClick(value);
  };

  onChangeOutputFormat = (e, { value }) => {
    this.props.onOutputFormatClick(value);
  };

  onChangeThumbFormat = (e, { value }) => {
    this.props.onThumbFormatClick(value);
  };

  onChangeFrameinfoPosition = (e, { value }) => {
    this.props.onFrameinfoPositionClick(value);
  };

  onChangeCachedFramesSize = (e, { value }) => {
    this.props.onCachedFramesSizeClick(value);
  };

  onChangeOverwrite = (e, { checked }) => {
    this.props.onOverwriteClick(checked);
  };

  onChangeIncludeIndividual = (e, { checked }) => {
    this.props.onIncludeIndividualClick(checked);
  };

  onChangeEmbedFrameNumbers = (e, { checked }) => {
    this.props.onEmbedFrameNumbersClick(checked);
  };

  onChangeEmbedFilePath = (e, { checked }) => {
    this.props.onEmbedFilePathClick(checked);
  };

  onChangeOpenFileExplorerAfterSaving = (e, { checked }) => {
    this.props.onOpenFileExplorerAfterSavingClick(checked);
  };

  onChangeThumbnailScale = (e, { value }) => {
    this.props.onThumbnailScaleClick(value);
  };

  onChangeMoviePrintWidth = (e, { value }) => {
    this.props.onMoviePrintWidthClick(value);
  };

  onChangeShotDetectionMethod = (e, { value }) => {
    this.props.onShotDetectionMethodClick(value);
  };

  colorPickerHandleClick = (e, id) => {
    e.stopPropagation();
    this.setState({
      displayColorPicker: {
        ...this.state.displayColorPicker,
        [id]: !this.state.displayColorPicker[id],
      },
    });
  };

  colorPickerHandleClose = (e, id) => {
    e.stopPropagation();
    this.setState({
      displayColorPicker: {
        ...this.state.displayColorPicker,
        [id]: false,
      },
    });
  };

  colorPickerHandleChange = (colorLocation, color) => {
    console.log(colorLocation);
    console.log(color);
    this.props.onMoviePrintBackgroundColorClick(colorLocation, color.rgb);
  };

  render() {
    const {
      columnCountTemp,
      file,
      fileScanRunning,
      isGridView,
      onApplyNewGridClick,
      onChangeColumn,
      onChangeColumnAndApply,
      onChangeMargin,
      onChangeOutputJpgQuality,
      onChangeThumbJpgQuality,
      onChangeFaceSizeThreshold,
      onChangeFaceConfidenceThreshold,
      onChangeFrameinfoMargin,
      onChangeFrameinfoScale,
      onChangeMinDisplaySceneLength,
      onChangeOutputPathClick,
      onChangeRow,
      onChangeSceneDetectionThreshold,
      onChangeTimelineViewWidthScale,
      onToggleDetectionChart,
      reCapture,
      recaptureAllFrames,
      rowCountTemp,
      sceneArray,
      secondsPerRowTemp,
      settings,
      sheetType,
      sheetName,
      showChart,
      thumbCount,
      thumbCountTemp,
      visibilitySettings,
    } = this.props;
    const {
      activeIndex,
      displayColorPicker,
      focusReference,
      outputSizeOptions,
      previewMoviePrintName,
      previewSingleThumbName,
      previewAllThumbsName,
      showSliders,
    } = this.state;
    const {
      defaultCachedFramesSize = 0,
      defaultDetectInOutPoint,
      defaultEmbedFilePath,
      defaultEmbedFrameNumbers,
      defaultShowFaceRect = DEFAULT_SHOW_FACERECT,
      defaultFaceSizeThreshold = FACE_SIZE_THRESHOLD,
      defaultFaceConfidenceThreshold = FACE_CONFIDENCE_THRESHOLD,
      defaultFaceUniquenessThreshold = FACE_UNIQUENESS_THRESHOLD,
      defaultFrameinfoBackgroundColor = DEFAULT_FRAMEINFO_BACKGROUND_COLOR,
      defaultFrameinfoColor = DEFAULT_FRAMEINFO_COLOR,
      defaultFrameinfoPosition = DEFAULT_FRAMEINFO_POSITION,
      defaultFrameinfoScale = DEFAULT_FRAMEINFO_SCALE,
      defaultFrameinfoMargin = DEFAULT_FRAMEINFO_MARGIN,
      defaultMarginRatio,
      defaultOutputJpgQuality = DEFAULT_OUTPUT_JPG_QUALITY,
      defaultThumbJpgQuality = DEFAULT_THUMB_JPG_QUALITY,
      defaultMarginSliderFactor,
      defaultMoviePrintBackgroundColor = DEFAULT_MOVIEPRINT_BACKGROUND_COLOR,
      defaultMoviePrintWidth,
      defaultOpenFileExplorerAfterSaving,
      defaultOutputFormat,
      defaultThumbFormat = DEFAULT_THUMB_FORMAT,
      defaultOutputPath,
      defaultOutputPathFromMovie,
      defaultPaperAspectRatioInv,
      defaultRoundedCorners,
      defaultSaveOptionIncludeIndividual,
      defaultSaveOptionOverwrite,
      defaultSceneDetectionThreshold,
      defaultShotDetectionMethod,
      defaultShowDetailsInHeader,
      defaultShowHeader,
      defaultShowPaperPreview,
      defaultShowPathInHeader,
      defaultShowTimelineInHeader,
      defaultThumbInfo,
      defaultTimelineViewFlow,
      defaultTimelineViewMinDisplaySceneLengthInFrames,
      defaultTimelineViewWidthScale,
      defaultMoviePrintName = DEFAULT_MOVIEPRINT_NAME,
      defaultSingleThumbName = DEFAULT_SINGLETHUMB_NAME,
      defaultAllThumbsName = DEFAULT_ALLTHUMBS_NAME,
    } = settings;
    const fileFps = file !== undefined ? file.fps : 25;
    const minutes = file !== undefined ? frameCountToMinutes(file.frameCount, fileFps) : undefined;
    const minutesRounded = Math.round(minutes);
    const cutsPerMinuteRounded = Math.round((thumbCountTemp - 1) / minutes);

    const frameNumberOrTimecode = ['[FN]', '[TC]'];
    const defaultSingleThumbNameContainsFrameNumberOrTimeCode = frameNumberOrTimecode.some(item =>
      defaultSingleThumbName.includes(item),
    );
    const defaultAllThumbsNameContainsFrameNumberOrTimeCode = frameNumberOrTimecode.some(item =>
      defaultAllThumbsName.includes(item),
    );

    const moviePrintBackgroundColorDependentOnFormat =
      defaultOutputFormat === OUTPUT_FORMAT.JPG // set alpha only for PNG
        ? {
            r: defaultMoviePrintBackgroundColor.r,
            g: defaultMoviePrintBackgroundColor.g,
            b: defaultMoviePrintBackgroundColor.b,
          }
        : defaultMoviePrintBackgroundColor;
    const moviePrintBackgroundColorDependentOnFormatString =
      defaultOutputFormat === OUTPUT_FORMAT.JPG // set alpha only for PNG
        ? `rgb(${defaultMoviePrintBackgroundColor.r}, ${defaultMoviePrintBackgroundColor.g}, ${defaultMoviePrintBackgroundColor.b})`
        : `rgba(${defaultMoviePrintBackgroundColor.r}, ${defaultMoviePrintBackgroundColor.g}, ${defaultMoviePrintBackgroundColor.b}, ${defaultMoviePrintBackgroundColor.a})`;

    const frameninfoBackgroundColorString = `rgba(${defaultFrameinfoBackgroundColor.r}, ${defaultFrameinfoBackgroundColor.g}, ${defaultFrameinfoBackgroundColor.b}, ${defaultFrameinfoBackgroundColor.a})`;
    const frameinfoColorString = `rgba(${defaultFrameinfoColor.r}, ${defaultFrameinfoColor.g}, ${defaultFrameinfoColor.b}, ${defaultFrameinfoColor.a})`;

    return (
      <Container
        style={{
          marginBottom: `${MENU_HEADER_HEIGHT + MENU_FOOTER_HEIGHT}px`,
        }}
      >
        <Grid padded inverted>
          {!isGridView && (
            <Grid.Row>
              <Grid.Column width={16}>
                <Statistic inverted size="tiny">
                  <Statistic.Value>{thumbCountTemp}</Statistic.Value>
                  <Statistic.Label>{thumbCountTemp === 1 ? 'Shot' : 'Shots'}</Statistic.Label>
                </Statistic>
                <Statistic inverted size="tiny">
                  <Statistic.Value>/</Statistic.Value>
                </Statistic>
                <Statistic inverted size="tiny">
                  <Statistic.Value>~{minutesRounded}</Statistic.Value>
                  <Statistic.Label>{minutesRounded === 1 ? 'Minute' : 'Minutes'}</Statistic.Label>
                </Statistic>
                <Statistic inverted size="tiny">
                  <Statistic.Value>≈</Statistic.Value>
                </Statistic>
                <Statistic inverted size="tiny">
                  <Statistic.Value>{cutsPerMinuteRounded}</Statistic.Value>
                  <Statistic.Label>cut/min</Statistic.Label>
                </Statistic>
              </Grid.Column>
            </Grid.Row>
          )}
          {isGridView && (
            <Grid.Row>
              <Grid.Column width={16}>
                <Statistic inverted size="tiny">
                  <Statistic.Value>{columnCountTemp}</Statistic.Value>
                  <Statistic.Label>{columnCountTemp === 1 ? 'Column' : 'Columns'}</Statistic.Label>
                </Statistic>
                <Statistic inverted size="tiny">
                  <Statistic.Value>×</Statistic.Value>
                </Statistic>
                <Statistic inverted size="tiny">
                  <Statistic.Value>{rowCountTemp}</Statistic.Value>
                  <Statistic.Label>{rowCountTemp === 1 ? 'Row' : 'Rows'}</Statistic.Label>
                </Statistic>
                <Statistic inverted size="tiny">
                  <Statistic.Value>{columnCountTemp * rowCountTemp === thumbCountTemp ? '=' : '≈'}</Statistic.Value>
                </Statistic>
                <Statistic inverted size="tiny" color={reCapture ? 'orange' : undefined}>
                  <Statistic.Value>{thumbCountTemp}</Statistic.Value>
                  <Statistic.Label>{reCapture ? 'Count' : 'Count'}</Statistic.Label>
                </Statistic>
              </Grid.Column>
            </Grid.Row>
          )}
          {isGridView && (
            <Grid.Row>
              <Grid.Column width={4}>Columns</Grid.Column>
              <Grid.Column width={12}>
                {showSliders && (
                  <SliderWithTooltip
                    data-tid="columnCountSlider"
                    className={styles.slider}
                    min={1}
                    max={20}
                    defaultValue={columnCountTemp}
                    value={columnCountTemp}
                    marks={{
                      1: '1',
                      20: '20',
                    }}
                    handle={handle}
                    onChange={
                      sheetType === SHEET_TYPE.INTERVAL && reCapture && isGridView
                        ? onChangeColumn
                        : onChangeColumnAndApply
                    }
                  />
                )}
                {!showSliders && (
                  <Input
                    type="number"
                    data-tid="columnCountInput"
                    className={styles.input}
                    defaultValue={columnCountTemp}
                    onKeyDown={
                      reCapture && isGridView
                        ? this.onChangeColumnCountViaInput
                        : this.onChangeColumnCountViaInputAndApply
                    }
                  />
                )}
              </Grid.Column>
            </Grid.Row>
          )}
          {sheetType === SHEET_TYPE.INTERVAL && isGridView && reCapture && (
            <Grid.Row>
              <Grid.Column width={4}>Rows</Grid.Column>
              <Grid.Column width={12}>
                {showSliders && (
                  <SliderWithTooltip
                    data-tid="rowCountSlider"
                    disabled={!reCapture}
                    className={styles.slider}
                    min={1}
                    max={20}
                    defaultValue={rowCountTemp}
                    value={rowCountTemp}
                    {...(reCapture ? {} : { value: rowCountTemp })}
                    marks={{
                      1: '1',
                      20: '20',
                    }}
                    handle={handle}
                    onChange={onChangeRow}
                  />
                )}
                {!showSliders && (
                  <Input
                    type="number"
                    data-tid="rowCountInput"
                    className={styles.input}
                    defaultValue={rowCountTemp}
                    onKeyDown={this.onChangeRowViaInput}
                  />
                )}
              </Grid.Column>
            </Grid.Row>
          )}
          {!isGridView && (
            <>
              <Grid.Row>
                <Grid.Column width={4}>Minutes per row</Grid.Column>
                <Grid.Column width={12}>
                  {showSliders && (
                    <SliderWithTooltip
                      data-tid="minutesPerRowSlider"
                      className={styles.slider}
                      min={10}
                      max={1800}
                      defaultValue={secondsPerRowTemp}
                      value={secondsPerRowTemp}
                      marks={{
                        10: '0.1',
                        60: '1',
                        300: '5',
                        600: '10',
                        1200: '20',
                        1800: '30',
                      }}
                      handle={handle}
                      onChange={this.props.onChangeTimelineViewSecondsPerRow}
                    />
                  )}
                  {!showSliders && (
                    <Input
                      type="number"
                      data-tid="minutesPerRowInput"
                      className={styles.input}
                      label={{ basic: true, content: 'sec' }}
                      labelPosition="right"
                      defaultValue={secondsPerRowTemp}
                      onKeyDown={this.onChangeTimelineViewSecondsPerRowViaInput}
                    />
                  )}
                </Grid.Column>
              </Grid.Row>
              {sheetType === SHEET_TYPE.SCENES && (
                <Grid.Row>
                  <Grid.Column width={4}></Grid.Column>
                  <Grid.Column width={12}>
                    <Checkbox
                      data-tid="changeTimelineViewFlow"
                      label={<label className={styles.label}>Natural flow</label>}
                      checked={defaultTimelineViewFlow}
                      onChange={this.onChangeTimelineViewFlow}
                    />
                  </Grid.Column>
                </Grid.Row>
              )}
              {sheetType === SHEET_TYPE.SCENES && (
                <Grid.Row>
                  <Grid.Column width={4}>Count</Grid.Column>
                  <Grid.Column width={12}>
                    <Checkbox
                      data-tid="changeSceneCountCheckbox"
                      label={<label className={styles.label}>Change scene count</label>}
                      checked={this.state.changeSceneCount}
                      onChange={this.onChangeSceneCount}
                    />
                  </Grid.Column>
                </Grid.Row>
              )}
              {sheetType === SHEET_TYPE.SCENES && this.state.changeSceneCount && (
                <>
                  <Grid.Row>
                    <Grid.Column width={4}>Shot detection threshold</Grid.Column>
                    <Grid.Column width={12}>
                      <SliderWithTooltip
                        // data-tid='sceneDetectionThresholdSlider'
                        className={styles.slider}
                        min={3}
                        max={40}
                        defaultValue={defaultSceneDetectionThreshold}
                        marks={{
                          3: '3',
                          15: '15',
                          30: '30',
                        }}
                        handle={handle}
                        onChange={onChangeSceneDetectionThreshold}
                      />
                    </Grid.Column>
                  </Grid.Row>
                  <Grid.Row>
                    <Grid.Column width={4}></Grid.Column>
                    <Grid.Column width={12}>
                      <Popup
                        trigger={
                          <Button
                            data-tid="runSceneDetectionBtn"
                            fluid
                            color="orange"
                            loading={fileScanRunning}
                            disabled={fileScanRunning}
                            onClick={() =>
                              this.props.runSceneDetection(
                                file.id,
                                file.path,
                                file.useRatio,
                                defaultSceneDetectionThreshold,
                              )
                            }
                          >
                            Add new MoviePrint
                          </Button>
                        }
                        mouseEnterDelay={1000}
                        on={['hover']}
                        position="bottom center"
                        className={stylesPop.popup}
                        content="Run shot detection with new threshold"
                      />
                    </Grid.Column>
                  </Grid.Row>
                </>
              )}
            </>
          )}
          {sheetType === SHEET_TYPE.INTERVAL && isGridView && (
            <Grid.Row>
              <Grid.Column width={4}>Count</Grid.Column>
              <Grid.Column width={12}>
                <Checkbox
                  data-tid="changeThumbCountCheckbox"
                  label={<label className={styles.label}>Change thumb count</label>}
                  checked={reCapture}
                  onChange={this.onChangeReCapture}
                />
              </Grid.Column>
            </Grid.Row>
          )}
          {sheetType === SHEET_TYPE.INTERVAL && isGridView && thumbCount !== thumbCountTemp && (
            <Grid.Row>
              <Grid.Column width={4} />
              <Grid.Column width={12}>
                <Message data-tid="applyNewGridMessage" color="orange" size="mini">
                  Applying a new grid will overwrite your previously selected thumbs. Don&apos;t worry, this can be
                  undone.
                </Message>
              </Grid.Column>
            </Grid.Row>
          )}
          {sheetType === SHEET_TYPE.INTERVAL && isGridView && (
            <Grid.Row>
              <Grid.Column width={4} />
              <Grid.Column width={12}>
                <Popup
                  trigger={
                    <Button
                      data-tid="applyNewGridBtn"
                      fluid
                      color="orange"
                      disabled={thumbCount === thumbCountTemp}
                      onClick={onApplyNewGridClick}
                    >
                      Apply
                    </Button>
                  }
                  mouseEnterDelay={1000}
                  on={['hover']}
                  position="bottom center"
                  className={stylesPop.popup}
                  content="Apply new grid for MoviePrint"
                />
              </Grid.Column>
            </Grid.Row>
          )}
          <Grid.Row>
            <Grid.Column width={16}>
              <Accordion inverted className={styles.accordion}>
                <Accordion.Title active={activeIndex === 0} index={0} onClick={this.handleClick}>
                  <Icon name="dropdown" />
                  Guide layout
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 0}>
                  <Grid padded inverted>
                    <Grid.Row>
                      <Grid.Column width={4} textAlign="right" verticalAlign="middle">
                        <Checkbox
                          data-tid="showPaperPreviewCheckbox"
                          checked={defaultShowPaperPreview}
                          onChange={this.onChangeShowPaperPreview}
                        />
                      </Grid.Column>
                      <Grid.Column width={12}>
                        <Dropdown
                          data-tid="paperLayoutOptionsDropdown"
                          placeholder="Select..."
                          selection
                          disabled={!defaultShowPaperPreview}
                          options={PAPER_LAYOUT_OPTIONS}
                          defaultValue={defaultPaperAspectRatioInv}
                          onChange={this.onChangePaperAspectRatio}
                        />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Accordion.Content>

                <Accordion.Title active={activeIndex === 1} index={1} onClick={this.handleClick}>
                  <Icon name="dropdown" />
                  Styling
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 1}>
                  <Grid padded inverted>
                    <Grid.Row>
                      <Grid.Column width={4}>Grid margin</Grid.Column>
                      <Grid.Column width={12}>
                        <SliderWithTooltip
                          // data-tid='marginSlider'
                          className={styles.slider}
                          min={0}
                          max={20}
                          defaultValue={defaultMarginRatio * defaultMarginSliderFactor}
                          marks={{
                            0: '0',
                            20: '20',
                          }}
                          handle={handle}
                          onChange={onChangeMargin}
                        />
                      </Grid.Column>
                    </Grid.Row>
                    {!isGridView && (
                      <Grid.Row>
                        <Grid.Column width={4}>Scene width ratio</Grid.Column>
                        <Grid.Column width={12}>
                          <SliderWithTooltip
                            data-tid="sceneWidthRatioSlider"
                            className={styles.slider}
                            min={0}
                            max={100}
                            defaultValue={defaultTimelineViewWidthScale}
                            marks={{
                              0: '-10',
                              50: '0',
                              100: '+10',
                            }}
                            handle={handle}
                            onChange={onChangeTimelineViewWidthScale}
                          />
                        </Grid.Column>
                      </Grid.Row>
                    )}
                    {!isGridView && (
                      <Grid.Row>
                        <Grid.Column width={4}>Min scene width</Grid.Column>
                        <Grid.Column width={12}>
                          <SliderWithTooltip
                            data-tid="minSceneWidthSlider"
                            className={styles.slider}
                            min={0}
                            max={10}
                            defaultValue={Math.round(
                              defaultTimelineViewMinDisplaySceneLengthInFrames / (fileFps * 1.0),
                            )}
                            marks={{
                              0: '0',
                              10: '10',
                            }}
                            handle={handle}
                            onChange={onChangeMinDisplaySceneLength}
                          />
                        </Grid.Column>
                      </Grid.Row>
                    )}
                    <Grid.Row>
                      <Grid.Column width={4}>Options</Grid.Column>
                      <Grid.Column width={12}>
                        <List>
                          {isGridView && (
                            <>
                              <List.Item>
                                <Checkbox
                                  data-tid="showHeaderCheckbox"
                                  label={<label className={styles.label}>Show header</label>}
                                  checked={defaultShowHeader}
                                  onChange={this.onChangeShowHeader}
                                />
                              </List.Item>
                              <List.Item>
                                <Checkbox
                                  data-tid="showFilePathCheckbox"
                                  className={styles.subCheckbox}
                                  label={<label className={styles.label}>Show file path</label>}
                                  disabled={!defaultShowHeader}
                                  checked={defaultShowPathInHeader}
                                  onChange={this.onChangeShowPathInHeader}
                                />
                              </List.Item>
                              <List.Item>
                                <Checkbox
                                  data-tid="showFileDetailsCheckbox"
                                  className={styles.subCheckbox}
                                  label={<label className={styles.label}>Show file details</label>}
                                  disabled={!defaultShowHeader}
                                  checked={defaultShowDetailsInHeader}
                                  onChange={this.onChangeShowDetailsInHeader}
                                />
                              </List.Item>
                              <List.Item>
                                <Checkbox
                                  data-tid="showTimelineCheckbox"
                                  className={styles.subCheckbox}
                                  label={<label className={styles.label}>Show timeline</label>}
                                  disabled={!defaultShowHeader}
                                  checked={defaultShowTimelineInHeader}
                                  onChange={this.onChangeShowTimelineInHeader}
                                />
                              </List.Item>
                              <List.Item>
                                <Checkbox
                                  data-tid="roundedCornersCheckbox"
                                  label={<label className={styles.label}>Rounded corners</label>}
                                  checked={defaultRoundedCorners}
                                  onChange={this.onChangeRoundedCorners}
                                />
                              </List.Item>
                              <List.Item>
                                <Checkbox
                                  data-tid="showHiddenThumbsCheckbox"
                                  label={<label className={styles.label}>Show hidden thumbs</label>}
                                  checked={visibilitySettings.visibilityFilter === THUMB_SELECTION.ALL_THUMBS}
                                  onChange={this.onChangeShowHiddenThumbs}
                                />
                              </List.Item>
                            </>
                          )}
                        </List>
                      </Grid.Column>
                    </Grid.Row>
                    <Divider inverted />
                    <Grid.Row>
                      <Grid.Column width={4}>Frame info</Grid.Column>
                      <Grid.Column width={12}>
                        <List>
                          <List.Item>
                            <Radio
                              data-tid="showFramesRadioBtn"
                              label={<label className={styles.label}>Show frames</label>}
                              name="radioGroup"
                              value="frames"
                              checked={defaultThumbInfo === 'frames'}
                              onChange={this.onChangeThumbInfo}
                            />
                          </List.Item>
                          <List.Item>
                            <Radio
                              data-tid="showTimecodeRadioBtn"
                              label={<label className={styles.label}>Show timecode</label>}
                              name="radioGroup"
                              value="timecode"
                              checked={defaultThumbInfo === 'timecode'}
                              onChange={this.onChangeThumbInfo}
                            />
                          </List.Item>
                          <List.Item>
                            <Radio
                              data-tid="hideInfoRadioBtn"
                              label={<label className={styles.label}>Hide info</label>}
                              name="radioGroup"
                              value="hideInfo"
                              checked={defaultThumbInfo === 'hideInfo'}
                              onChange={this.onChangeThumbInfo}
                            />
                          </List.Item>
                        </List>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Font color</Grid.Column>
                      <Grid.Column width={12}>
                        <div>
                          <div
                            className={styles.colorPickerSwatch}
                            onClick={e => this.colorPickerHandleClick(e, 'frameinfoColor')}
                          >
                            <Checkboard />
                            <div
                              className={`${styles.colorPickerColor} ${styles.colorPickerText}`}
                              style={{
                                backgroundColor: frameninfoBackgroundColorString,
                                color: frameinfoColorString,
                              }}
                            >
                              00:00:00:00
                            </div>
                          </div>
                          {displayColorPicker.frameinfoColor ? (
                            <div
                              className={styles.colorPickerPopover}
                              // onMouseLeave={(e) => this.colorPickerHandleClose(e, 'frameinfoColor')}
                            >
                              <div
                                className={styles.colorPickerCover}
                                onClick={e => this.colorPickerHandleClose(e, 'frameinfoColor')}
                              />
                              <SketchPicker
                                color={defaultFrameinfoColor}
                                onChange={color => this.colorPickerHandleChange('frameinfoColor', color)}
                                presetColors={COLOR_PALETTE_PICO_EIGHT}
                              />
                            </div>
                          ) : null}
                        </div>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Background color</Grid.Column>
                      <Grid.Column width={12}>
                        <div>
                          <div
                            className={styles.colorPickerSwatch}
                            onClick={e => this.colorPickerHandleClick(e, 'frameninfoBackgroundColor')}
                          >
                            <Checkboard />
                            <div
                              className={styles.colorPickerColor}
                              style={{
                                backgroundColor: frameninfoBackgroundColorString,
                              }}
                            />
                          </div>
                          {displayColorPicker.frameninfoBackgroundColor ? (
                            <div
                              className={styles.colorPickerPopover}
                              // onMouseLeave={(e) => this.colorPickerHandleClose(e, 'frameninfoBackgroundColor')}
                            >
                              <div
                                className={styles.colorPickerCover}
                                onClick={e => this.colorPickerHandleClose(e, 'frameninfoBackgroundColor')}
                              />
                              <SketchPicker
                                color={defaultFrameinfoBackgroundColor}
                                onChange={color => this.colorPickerHandleChange('frameninfoBackgroundColor', color)}
                                presetColors={COLOR_PALETTE_PICO_EIGHT}
                              />
                            </div>
                          ) : null}
                        </div>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Position</Grid.Column>
                      <Grid.Column width={12}>
                        <Dropdown
                          data-tid="changeFrameinfoPositionDropdown"
                          placeholder="Select..."
                          selection
                          options={FRAMEINFO_POSITION_OPTIONS}
                          defaultValue={defaultFrameinfoPosition}
                          onChange={this.onChangeFrameinfoPosition}
                        />
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Size</Grid.Column>
                      <Grid.Column width={12}>
                        <SliderWithTooltip
                          data-tid="frameinfoScaleSlider"
                          className={styles.slider}
                          min={1}
                          max={100}
                          defaultValue={defaultFrameinfoScale}
                          marks={{
                            1: '1',
                            10: '10',
                            100: '100',
                          }}
                          handle={handle}
                          onChange={onChangeFrameinfoScale}
                        />
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Margin</Grid.Column>
                      <Grid.Column width={12}>
                        <SliderWithTooltip
                          data-tid="frameinfoMarginSlider"
                          className={styles.slider}
                          min={0}
                          max={50}
                          defaultValue={defaultFrameinfoMargin}
                          marks={{
                            0: '0',
                            50: '50',
                          }}
                          handle={handle}
                          onChange={onChangeFrameinfoMargin}
                        />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Accordion.Content>

                <Accordion.Title active={activeIndex === 2} index={2} onClick={this.handleClick}>
                  <Icon name="dropdown" />
                  Output
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 2}>
                  <Grid padded inverted>
                    <Grid.Row>
                      <Grid.Column width={4}>File path</Grid.Column>
                      <Grid.Column width={12}>
                        <List>
                          <List.Item>
                            <div
                              style={{
                                wordWrap: 'break-word',
                                opacity: defaultOutputPathFromMovie ? '0.5' : '1.0',
                              }}
                            >
                              {defaultOutputPath}
                            </div>
                          </List.Item>
                          <List.Item>
                            <Button
                              data-tid="changeOutputPathBtn"
                              onClick={onChangeOutputPathClick}
                              disabled={defaultOutputPathFromMovie}
                            >
                              Change...
                            </Button>
                          </List.Item>
                          <List.Item>
                            <Checkbox
                              data-tid="showPaperPreviewCheckbox"
                              label={<label className={styles.label}>Same as movie file</label>}
                              style={{
                                marginTop: '8px',
                              }}
                              checked={defaultOutputPathFromMovie}
                              onChange={this.onChangeOutputPathFromMovie}
                            />
                          </List.Item>
                        </List>
                      </Grid.Column>
                    </Grid.Row>
                    <Divider inverted />
                    <Grid.Row>
                      <Grid.Column width={16}>
                        <h4>MoviePrint</h4>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Size</Grid.Column>
                      <Grid.Column width={12}>
                        <Dropdown
                          data-tid="changeMoviePrintWidthDropdown"
                          placeholder="Select..."
                          selection
                          options={getOutputSizeOptions(
                            MOVIEPRINT_WIDTH_HEIGHT,
                            file,
                            columnCountTemp,
                            thumbCountTemp,
                            settings,
                            visibilitySettings,
                            sceneArray,
                            secondsPerRowTemp,
                            isGridView,
                          )}
                          defaultValue={defaultMoviePrintWidth}
                          onChange={this.onChangeMoviePrintWidth}
                        />
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Format</Grid.Column>
                      <Grid.Column width={12}>
                        <Dropdown
                          data-tid="changeOutputFormatDropdown"
                          placeholder="Select..."
                          selection
                          options={OUTPUT_FORMAT_OPTIONS}
                          defaultValue={defaultOutputFormat}
                          onChange={this.onChangeOutputFormat}
                        />
                      </Grid.Column>
                    </Grid.Row>
                    {defaultOutputFormat === OUTPUT_FORMAT.JPG && (
                      <Grid.Row>
                        <Grid.Column width={4}>JPG quality</Grid.Column>
                        <Grid.Column width={12}>
                          <SliderWithTooltip
                            data-tid="outputJpgQualitySlider"
                            className={styles.slider}
                            min={0}
                            max={100}
                            defaultValue={defaultOutputJpgQuality}
                            marks={{
                              0: '0',
                              80: '80',
                              100: '100',
                            }}
                            handle={handle}
                            onChange={onChangeOutputJpgQuality}
                          />
                        </Grid.Column>
                      </Grid.Row>
                    )}
                    <Grid.Row>
                      <Grid.Column width={4}>Background color</Grid.Column>
                      <Grid.Column width={12}>
                        <div>
                          <div
                            className={styles.colorPickerSwatch}
                            onClick={e => this.colorPickerHandleClick(e, 'moviePrintBackgroundColor')}
                          >
                            <Checkboard />
                            <div
                              className={styles.colorPickerColor}
                              style={{
                                backgroundColor: moviePrintBackgroundColorDependentOnFormatString,
                              }}
                            />
                          </div>
                          {displayColorPicker.moviePrintBackgroundColor ? (
                            <div
                              className={styles.colorPickerPopover}
                              // onMouseLeave={(e) => this.colorPickerHandleClose(e, 'moviePrintBackgroundColor')}
                            >
                              <div
                                className={styles.colorPickerCover}
                                onClick={e => this.colorPickerHandleClose(e, 'moviePrintBackgroundColor')}
                              />
                              <SketchPicker
                                color={moviePrintBackgroundColorDependentOnFormat}
                                onChange={color => this.colorPickerHandleChange('moviePrintBackgroundColor', color)}
                                disableAlpha={defaultOutputFormat === OUTPUT_FORMAT.JPG}
                                presetColors={COLOR_PALETTE_PICO_EIGHT}
                              />
                            </div>
                          ) : null}
                        </div>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Save options</Grid.Column>
                      <Grid.Column width={12}>
                        <List>
                          <List.Item>
                            <Checkbox
                              data-tid="overwriteExistingCheckbox"
                              label={<label className={styles.label}>Overwrite existing</label>}
                              checked={defaultSaveOptionOverwrite}
                              onChange={this.onChangeOverwrite}
                            />
                          </List.Item>
                          <List.Item>
                            <Checkbox
                              data-tid="includeIndividualFramesCheckbox"
                              label={<label className={styles.label}>Include individual thumbs</label>}
                              checked={defaultSaveOptionIncludeIndividual}
                              onChange={this.onChangeIncludeIndividual}
                            />
                          </List.Item>
                          <List.Item>
                            <Checkbox
                              data-tid="embedFrameNumbersCheckbox"
                              label={<label className={styles.label}>Embed frameNumbers (only PNG)</label>}
                              checked={defaultEmbedFrameNumbers}
                              onChange={this.onChangeEmbedFrameNumbers}
                            />
                          </List.Item>
                          <List.Item>
                            <Checkbox
                              data-tid="embedFilePathCheckbox"
                              label={<label className={styles.label}>Embed filePath (only PNG)</label>}
                              checked={defaultEmbedFilePath}
                              onChange={this.onChangeEmbedFilePath}
                            />
                          </List.Item>
                          <List.Item>
                            <Checkbox
                              data-tid="embedFilePathCheckbox"
                              label={<label className={styles.label}>Open File Explorer after saving</label>}
                              checked={defaultOpenFileExplorerAfterSaving}
                              onChange={this.onChangeOpenFileExplorerAfterSaving}
                            />
                          </List.Item>
                        </List>
                      </Grid.Column>
                    </Grid.Row>
                    <Divider inverted />
                    <Grid.Row>
                      <Grid.Column width={16}>
                        <h4>Thumbs</h4>
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Format</Grid.Column>
                      <Grid.Column width={12}>
                        <Dropdown
                          data-tid="changeThumbFormatDropdown"
                          placeholder="Select..."
                          selection
                          options={OUTPUT_FORMAT_OPTIONS}
                          defaultValue={defaultThumbFormat}
                          onChange={this.onChangeThumbFormat}
                        />
                      </Grid.Column>
                    </Grid.Row>
                    {defaultThumbFormat === OUTPUT_FORMAT.JPG && (
                      <Grid.Row>
                        <Grid.Column width={4}>JPG quality</Grid.Column>
                        <Grid.Column width={12}>
                          <SliderWithTooltip
                            data-tid="thumbJpgQualitySlider"
                            className={styles.slider}
                            min={0}
                            max={100}
                            defaultValue={defaultThumbJpgQuality}
                            marks={{
                              0: '0',
                              95: '95',
                              100: '100',
                            }}
                            handle={handle}
                            onChange={onChangeThumbJpgQuality}
                          />
                        </Grid.Column>
                      </Grid.Row>
                    )}
                  </Grid>
                </Accordion.Content>

                <Accordion.Title active={activeIndex === 3} index={3} onClick={this.handleClick}>
                  <Icon name="dropdown" />
                  Naming scheme
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 3}>
                  <Grid padded inverted>
                    <Grid.Row>
                      <Grid.Column width={16}>
                        <label>File name when saving a MoviePrint</label>
                        <Input
                          // ref={this.inputDefaultMoviePrintName}
                          data-tid="defaultMoviePrintNameInput"
                          name="defaultMoviePrintNameInput" // needed for addAttributeIntoInput
                          fluid
                          placeholder="MoviePrint name"
                          defaultValue={defaultMoviePrintName}
                          onFocus={this.setFocusReference}
                          onBlur={this.onSubmitDefaultMoviePrintName}
                          onKeyUp={this.onSubmitDefaultMoviePrintName}
                        />
                        <Label className={styles.previewCustomName}>
                          {previewMoviePrintName}.{defaultOutputFormat}
                        </Label>
                        <Divider hidden className={styles.smallDivider} />
                        <label>File name of thumb when saving a single thumb</label>
                        <Input
                          // ref={this.inputDefaultSingleThumbName}
                          data-tid="defaultSingleThumbNameInput"
                          name="defaultSingleThumbNameInput" // needed for addAttributeIntoInput
                          fluid
                          placeholder="Name when saving a single thumb"
                          defaultValue={defaultSingleThumbName}
                          onFocus={this.setFocusReference}
                          onBlur={this.onSubmitDefaultSingleThumbName}
                          onKeyUp={this.onSubmitDefaultSingleThumbName}
                        />
                        <Label
                          className={styles.previewCustomName}
                          color={defaultSingleThumbNameContainsFrameNumberOrTimeCode ? undefined : 'orange'}
                          pointing={defaultSingleThumbNameContainsFrameNumberOrTimeCode ? undefined : true}
                        >
                          {defaultSingleThumbNameContainsFrameNumberOrTimeCode
                            ? undefined
                            : 'The framenumber attribute is missing. This can lead to the thumb being overwritten. | '}
                          {previewSingleThumbName}.jpg
                        </Label>
                        <Divider hidden className={styles.smallDivider} />
                        <label>
                          File name of thumbs when <em>Include individual thumbs</em> is selected
                        </label>
                        <Input
                          // ref={this.inputDefaultAllThumbsName}
                          data-tid="defaultAllThumbsNameInput"
                          name="defaultAllThumbsNameInput" // needed for addAttributeIntoInput
                          fluid
                          placeholder="Name when including individual thumbs"
                          defaultValue={defaultAllThumbsName}
                          onFocus={this.setFocusReference}
                          onBlur={this.onSubmitDefaultAllThumbsName}
                          onKeyUp={this.onSubmitDefaultAllThumbsName}
                        />
                        <Label
                          className={styles.previewCustomName}
                          color={defaultAllThumbsNameContainsFrameNumberOrTimeCode ? undefined : 'orange'}
                          pointing={defaultAllThumbsNameContainsFrameNumberOrTimeCode ? undefined : true}
                        >
                          {defaultAllThumbsNameContainsFrameNumberOrTimeCode
                            ? undefined
                            : 'The framenumber attribute is missing. This can lead to the thumb being overwritten. | '}
                          {previewAllThumbsName}.jpg
                        </Label>
                        <h6>Available attributes</h6>
                        <Button
                          data-tid="addAttribute[MN]IntoInputButton"
                          className={styles.attributeButton}
                          onClick={() => this.addAttributeIntoInput('[MN]')}
                          disabled={focusReference === undefined}
                          size="mini"
                        >
                          [MN] Movie name
                        </Button>
                        <Button
                          data-tid="addAttribute[ME]IntoInputButton"
                          className={styles.attributeButton}
                          onClick={() => this.addAttributeIntoInput('[ME]')}
                          disabled={focusReference === undefined}
                          size="mini"
                        >
                          [ME] Movie extension
                        </Button>
                        <Button
                          data-tid="addAttribute[MPN]IntoInputButton"
                          className={styles.attributeButton}
                          onClick={() => this.addAttributeIntoInput('[MPN]')}
                          disabled={focusReference === undefined}
                          size="mini"
                        >
                          [MPN] MoviePrint name
                        </Button>
                        <Button
                          data-tid="addAttribute[FN]IntoInputButton"
                          className={styles.attributeButton}
                          onClick={() => this.addAttributeIntoInput('[FN]')}
                          disabled={focusReference === undefined}
                          size="mini"
                        >
                          [FN] Frame number
                        </Button>
                        <Button
                          data-tid="addAttribute[TC]IntoInputButton"
                          className={styles.attributeButton}
                          onClick={() => this.addAttributeIntoInput('[TC]')}
                          disabled={focusReference === undefined}
                          size="mini"
                        >
                          [TC] Timecode
                        </Button>
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Accordion.Content>

                <Accordion.Title active={activeIndex === 4} index={4} onClick={this.handleClick}>
                  <Icon name="dropdown" />
                  Face detection
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 4}>
                  <Grid padded inverted>
                    <Grid.Row>
                      <Grid.Column width={4}>Face confidence threshold</Grid.Column>
                      <Grid.Column width={12}>
                        <SliderWithTooltip
                          data-tid="faceConfidenceThresholdSlider"
                          className={styles.slider}
                          min={0}
                          max={100}
                          defaultValue={defaultFaceConfidenceThreshold}
                          marks={{
                            0: '0',
                            50: '50',
                            100: '100',
                          }}
                          handle={handle}
                          onChange={onChangeFaceConfidenceThreshold}
                        />
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Face size threshold</Grid.Column>
                      <Grid.Column width={12}>
                        <SliderWithTooltip
                          data-tid="faceSizeThresholdSlider"
                          className={styles.slider}
                          min={0}
                          max={100}
                          defaultValue={defaultFaceSizeThreshold}
                          marks={{
                            0: '0',
                            50: '50',
                            100: '100',
                          }}
                          handle={handle}
                          onChange={onChangeFaceSizeThreshold}
                        />
                        <br />
                        <em>Changes take effect on next face scan.</em>
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Accordion.Content>

                <Accordion.Title active={activeIndex === 5} index={5} onClick={this.handleClick}>
                  <Icon name="dropdown" />
                  Frame cache
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 5}>
                  <Grid padded inverted>
                    <Grid.Row>
                      <Grid.Column width={4}>Max size</Grid.Column>
                      <Grid.Column width={12}>
                        <Dropdown
                          data-tid="changeCachedFramesSizeDropdown"
                          placeholder="Select..."
                          selection
                          options={CACHED_FRAMES_SIZE_OPTIONS}
                          defaultValue={defaultCachedFramesSize}
                          onChange={this.onChangeCachedFramesSize}
                        />
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4} />
                      <Grid.Column width={12}>
                        <Popup
                          trigger={
                            <Button data-tid="updateFrameCacheBtn" onClick={recaptureAllFrames}>
                              Update frame cache
                            </Button>
                          }
                          mouseEnterDelay={1000}
                          on={['hover']}
                          position="bottom center"
                          className={stylesPop.popup}
                          content="Recapture all frames and store it in the frame cache (uses max size)"
                        />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Accordion.Content>

                <Accordion.Title active={activeIndex === 6} index={6} onClick={this.handleClick}>
                  <Icon name="dropdown" />
                  Experimental
                </Accordion.Title>
                <Accordion.Content active={activeIndex === 6}>
                  <Grid padded inverted>
                    <Grid.Row>
                      <Grid.Column width={4}>Shot detection method</Grid.Column>
                      <Grid.Column width={12}>
                        <Dropdown
                          data-tid="shotDetectionMethodOptionsDropdown"
                          placeholder="Select..."
                          selection
                          options={SHOT_DETECTION_METHOD_OPTIONS}
                          defaultValue={defaultShotDetectionMethod}
                          onChange={this.onChangeShotDetectionMethod}
                        />
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Detection chart</Grid.Column>
                      <Grid.Column width={12}>
                        <Popup
                          trigger={
                            <Button
                              data-tid="showDetectionChartBtn"
                              // fluid
                              onClick={onToggleDetectionChart}
                            >
                              {showChart ? 'Hide detection chart' : 'Show detection chart'}
                            </Button>
                          }
                          mouseEnterDelay={1000}
                          on={['hover']}
                          position="bottom center"
                          className={stylesPop.popup}
                          content="Show detection chart with mean and difference values per frame"
                        />
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Import options</Grid.Column>
                      <Grid.Column width={12}>
                        <Checkbox
                          data-tid="automaticDetectionInOutPointCheckbox"
                          label={<label className={styles.label}>Automatic detection of In and Outpoint</label>}
                          checked={defaultDetectInOutPoint}
                          onChange={this.onChangeDetectInOutPoint}
                        />
                      </Grid.Column>
                    </Grid.Row>
                    <Grid.Row>
                      <Grid.Column width={4}>Expert</Grid.Column>
                      <Grid.Column width={12}>
                        <Checkbox
                          data-tid="showSlidersCheckbox"
                          label={<label className={styles.label}>Show input field instead of slider</label>}
                          checked={!this.state.showSliders}
                          onChange={this.onShowSliders}
                        />
                      </Grid.Column>
                    </Grid.Row>
                  </Grid>
                </Accordion.Content>
              </Accordion>
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </Container>
    );
  }
}

SettingsList.contextTypes = {
  store: PropTypes.object,
};

export default SettingsList;
