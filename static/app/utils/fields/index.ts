export enum FieldKind {
  TAG = 'tag',
  MEASUREMENT = 'measurement',
  BREAKDOWN = 'breakdown',
  FIELD = 'field',
  FUNCTION = 'function',
  EQUATION = 'equation',
  METRICS = 'metric',
  NUMERIC_METRICS = 'numeric_metric',
}

export enum FieldKey {
  AGE = 'age',
  ASSIGNED = 'assigned',
  ASSIGNED_OR_SUGGESTED = 'assigned_or_suggested',
  BOOKMARKS = 'bookmarks',
  CULPRIT = 'culprit',
  DEVICE_ARCH = 'device.arch',
  DEVICE_BATTERY_LEVEL = 'device.battery_level',
  DEVICE_BRAND = 'device.brand',
  DEVICE_CHARGING = 'device.charging',
  DEVICE_FAMILY = 'device.family',
  DEVICE_LOCALE = 'device.locale',
  DEVICE_MODEL_ID = 'device.model_id',
  DEVICE_NAME = 'device.name',
  DEVICE_ONLINE = 'device.online',
  DEVICE_ORIENTATION = 'device.orientation',
  DEVICE_SIMULATOR = 'device.simulator',
  DEVICE_UUID = 'device.uuid',
  DIST = 'dist',
  ENVIRONMENT = 'environment',
  ERROR_HANDLED = 'error.handled',
  ERROR_MECHANISM = 'error.mechanism',
  ERROR_TYPE = 'error.type',
  ERROR_UNHANDLED = 'error.unhandled',
  ERROR_VALUE = 'error.value',
  EVENT_TIMESTAMP = 'event.timestamp',
  EVENT_TYPE = 'event.type',
  FIRST_RELEASE = 'firstRelease',
  FIRST_SEEN = 'firstSeen',
  GEO_CITY = 'geo.city',
  GEO_COUNTRY_CODE = 'geo.country_code',
  GEO_REGION = 'geo.region',
  HAS = 'has',
  HTTP_METHOD = 'http.method',
  HTTP_REFERER = 'http.referer',
  HTTP_STATUS_CODE = 'http.status_code',
  HTTP_URL = 'http.url',
  ID = 'id',
  IS = 'is',
  ISSUE = 'issue',
  LAST_SEEN = 'lastSeen',
  LEVEL = 'level',
  LOCATION = 'location',
  MESSAGE = 'message',
  OS = 'os',
  OS_BUILD = 'os.build',
  OS_KERNEL_VERSION = 'os.kernel_version',
  PLATFORM = 'platform',
  PLATFORM_NAME = 'platform.name',
  PROJECT = 'project',
  RELEASE = 'release',
  RELEASE_BUILD = 'release.build',
  RELEASE_PACKAGE = 'release.package',
  RELEASE_STAGE = 'release.stage',
  RELEASE_VERSION = 'release.version',
  SDK_NAME = 'sdk.name',
  SDK_VERSION = 'sdk.version',
  STACK_ABS_PATH = 'stack.abs_path',
  STACK_COLNO = 'stack.colno',
  STACK_FILENAME = 'stack.filename',
  STACK_FUNCTION = 'stack.function',
  STACK_IN_APP = 'stack.in_app',
  STACK_LINENO = 'stack.lineno',
  STACK_MODULE = 'stack.module',
  STACK_PACKAGE = 'stack.package',
  STACK_RESOURCE = 'stack.resource',
  STACK_STACK_LEVEL = 'stack.stack_level',
  TIMESTAMP = 'timestamp',
  TIMESTAMP_TO_DAY = 'timestamp.to_day',
  TIMESTAMP_TO_HOUR = 'timestamp.to_hour',
  TIMES_SEEN = 'timesSeen',
  TITLE = 'title',
  TRACE = 'trace',
  TRACE_PARENT_SPAN = 'trace.parent_span',
  TRACE_SPAN = 'trace.span',
  TRANSACTION = 'transaction',
  TRANSACTION_DURATION = 'transaction.duration',
  TRANSACTION_OP = 'transaction.op',
  TRANSACTION_STATUS = 'transaction.status',
  USER = 'user',
  USER_DISPLAY = 'user.display',
  USER_EMAIL = 'user.email',
  USER_ID = 'user.id',
  USER_IP = 'user.ip',
  USER_USERNAME = 'user.username',
}

export enum WebVital {
  FP = 'measurements.fp',
  FCP = 'measurements.fcp',
  LCP = 'measurements.lcp',
  FID = 'measurements.fid',
  CLS = 'measurements.cls',
  TTFB = 'measurements.ttfb',
  RequestTime = 'measurements.ttfb.requesttime',
}

export enum MobileVital {
  AppStartCold = 'measurements.app_start_cold',
  AppStartWarm = 'measurements.app_start_warm',
  FramesTotal = 'measurements.frames_total',
  FramesSlow = 'measurements.frames_slow',
  FramesFrozen = 'measurements.frames_frozen',
  FramesSlowRate = 'measurements.frames_slow_rate',
  FramesFrozenRate = 'measurements.frames_frozen_rate',
  StallCount = 'measurements.stall_count',
  StallTotalTime = 'measurements.stall_total_time',
  StallLongestTime = 'measurements.stall_longest_time',
  StallPercentage = 'measurements.stall_percentage',
}

export enum AggregationFields {
  Count = 'count',
  CountUnique = 'count_unique',
  CountMiserable = 'count_miserable',
  CountIf = 'count_if',
  CountWebVitals = 'count_web_vitals',
  Eps = 'eps',
  Epm = 'epm',
  FailureCount = 'failure_count',
  Min = 'min',
  Max = 'max',
  Sum = 'sum',
  Any = 'any',
  P50 = 'p50',
  P75 = 'p75',
  P95 = 'p95',
  P99 = 'p99',
  P100 = 'p100',
  Percentile = 'percentile',
  Avg = 'avg',
  Apdex = 'apdex',
  UserMisery = 'user_misery',
  FailureRate = 'failure_rate',
  LastSeen = 'last_seen',
}

export enum FieldValueType {
  BOOLEAN = 'boolean',
  DATE = 'date',
  DURATION = 'duration',
  INTEGER = 'integer',
  NUMBER = 'number',
  PERCENTAGE = 'percentage',
  STRING = 'string',
  NONE = 'none',
}

export interface FieldDefinition {
  kind: FieldKind;
  valueType: FieldValueType;
  desc?: string;
}

export const AGGREGATION_FIELDS: Record<string, FieldDefinition> = {
  [AggregationFields.Count]: {
    desc: 'Returns the count for the selected field',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NUMBER,
  },
  [AggregationFields.CountUnique]: {
    desc: 'Returns the unique count for the unique field',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.INTEGER,
  },
  [AggregationFields.CountMiserable]: {
    desc: 'Returns a score of miserable users',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NUMBER,
  },
  [AggregationFields.CountIf]: {
    desc: 'Returns results based on conditional case',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NUMBER,
  },
  [AggregationFields.CountWebVitals]: {
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NUMBER,
  },
  [AggregationFields.Eps]: {
    desc: 'Returns events per second',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NUMBER,
  },
  [AggregationFields.Epm]: {
    desc: 'Returns events per minute',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NUMBER,
  },
  [AggregationFields.FailureCount]: {
    desc: 'Returns failed event count based on transaction.status',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NUMBER,
  },
  [AggregationFields.Min]: {
    desc: 'Returns the minimum value of the selected field',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.Max]: {
    desc: 'Returns maximum value of the selected field',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.Sum]: {
    desc: 'Returns the total value for the selected field',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.Any]: {
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.P50]: {
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.P75]: {
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.P95]: {
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.P99]: {
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.P100]: {
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.Percentile]: {
    desc: 'Returns the percentile of the selected field',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.Avg]: {
    desc: 'Returns averages for a selected field',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.Apdex]: {
    desc: 'Returns the apdex score based on a duration threshold',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
  [AggregationFields.UserMisery]: {
    desc: 'Returns transactions of miserable users between 0 to 1',
    kind: FieldKind.FUNCTION,
    valueType: FieldValueType.NONE,
  },
};

export const MEASUREMENT_FIELDS: Record<string, FieldDefinition> = {
  [WebVital.FP]: {
    desc: 'Web Vital First Paint',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.DURATION,
  },
  [WebVital.FCP]: {
    desc: 'Web Vital First Contentful Paint',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.DURATION,
  },
  [WebVital.LCP]: {
    desc: 'Web Vital Largest Contentful Paint',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.DURATION,
  },
  [WebVital.FID]: {
    desc: 'Web Vital First Input Delay',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.DURATION,
  },
  [WebVital.CLS]: {
    desc: 'Web Vital Cumulative Layout Shift ',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.NUMBER,
  },
  [WebVital.TTFB]: {
    desc: 'Web Vital Time To First Byte',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.DURATION,
  },
  [WebVital.RequestTime]: {
    desc: 'Time between start of request to start of response',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.DURATION,
  },
  [MobileVital.AppStartCold]: {
    desc: 'First launch (not in memory and no process exists)',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.DURATION,
  },
  [MobileVital.AppStartWarm]: {
    desc: 'Already launched (partial memory and process may exist)',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.DURATION,
  },
  [MobileVital.FramesTotal]: {
    desc: 'Total number of frames',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.INTEGER,
  },
  [MobileVital.FramesSlow]: {
    desc: 'Number of slow frames',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.INTEGER,
  },
  [MobileVital.FramesFrozen]: {
    desc: 'Number of frozen frames',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.INTEGER,
  },
  [MobileVital.FramesSlowRate]: {
    desc: 'Number of slow frames out of the total',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.PERCENTAGE,
  },
  [MobileVital.FramesFrozenRate]: {
    desc: 'Number of frozen frames out of the total',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.PERCENTAGE,
  },
  [MobileVital.StallCount]: {
    desc: 'Count of slow Javascript event loops (React Native)',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.INTEGER,
  },
  [MobileVital.StallTotalTime]: {
    desc: 'Total stall duration (React Native)',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.PERCENTAGE,
  },
  [MobileVital.StallLongestTime]: {
    desc: 'Duration of slowest Javascript event loop (React Native)',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.INTEGER,
  },
  [MobileVital.StallPercentage]: {
    desc: 'Total stall duration out of the total transaction duration',
    kind: FieldKind.METRICS,
    valueType: FieldValueType.PERCENTAGE,
  },
};

export const FIELDS: Record<string, FieldDefinition> = {
  ...AGGREGATION_FIELDS,
  ...MEASUREMENT_FIELDS,
  [FieldKey.AGE]: {
    kind: FieldKind.FIELD,
    valueType: FieldValueType.DURATION,
  },
  [FieldKey.ASSIGNED]: {
    desc: 'Assignee of the issue as a user ID',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.ASSIGNED_OR_SUGGESTED]: {
    desc: 'Assignee or suggestee of the issue as a user ID',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.CULPRIT]: {
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.BOOKMARKS]: {
    desc: 'The issues bookmarked by a user ID',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.DEVICE_ARCH]: {
    desc: 'CPU architecture',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.DEVICE_BATTERY_LEVEL]: {
    desc: 'Indicator of how much battery is at',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.DEVICE_BRAND]: {
    desc: 'Brand of device',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.DEVICE_CHARGING]: {
    desc: 'Charging at the time of the event',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.BOOLEAN,
  },
  [FieldKey.DEVICE_FAMILY]: {
    desc: 'Model name across generations',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.DEVICE_LOCALE]: {
    desc: "The locale of the user's device",
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.DEVICE_MODEL_ID]: {
    desc: 'Internal hardware revision',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.DEVICE_NAME]: {
    desc: 'Descriptor details',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.DEVICE_ONLINE]: {
    desc: 'Online at the time of the event',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.BOOLEAN,
  },
  [FieldKey.DEVICE_ORIENTATION]: {
    desc: 'Portrait or landscape view ',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.DEVICE_SIMULATOR]: {
    desc: 'Determines if it occured on a simulator',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.BOOLEAN,
  },
  [FieldKey.DEVICE_UUID]: {
    desc: 'Unique device identifier',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.ERROR_HANDLED]: {
    desc: 'Determines handling status of the error',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.BOOLEAN,
  },
  [FieldKey.ERROR_MECHANISM]: {
    desc: 'The mechanism that created the error',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.ERROR_TYPE]: {
    desc: 'The type of exception',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.ERROR_UNHANDLED]: {
    desc: 'Determines unhandling status of the error',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.BOOLEAN,
  },
  [FieldKey.ERROR_VALUE]: {
    desc: 'Original value that exhibits error',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.EVENT_TIMESTAMP]: {
    desc: 'Date and time of the event',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.EVENT_TYPE]: {
    desc: 'Type of event (Errors, transactions, csp and default)',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.GEO_CITY]: {
    desc: 'Full name of the city',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.GEO_COUNTRY_CODE]: {
    desc: 'Country code based on ISO 3166-1',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.GEO_REGION]: {
    desc: 'Full name of the country',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.HTTP_METHOD]: {
    desc: 'Method of the request that created the event',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.HTTP_REFERER]: {
    desc: 'The web page the resource was requested from',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.HTTP_STATUS_CODE]: {
    desc: 'Type of response (i.e. 200, 404)',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.HTTP_URL]: {
    desc: 'Full URL of the request without parameters',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.ID]: {
    desc: 'The event identification number',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.IS]: {
    desc: 'The properties of an issue (i.e. Resolved, unresolved)',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.ISSUE]: {
    desc: 'The issue identification code',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.LAST_SEEN]: {
    desc: 'Issues last seen at a given time',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.DATE,
  },
  [FieldKey.LEVEL]: {
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.LOCATION]: {
    desc: 'Location of error',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.MESSAGE]: {
    desc: 'Matches the error message or transaction name',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.OS]: {
    desc: 'Build and kernel version',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.OS_BUILD]: {
    desc: 'Name of the build',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.OS_KERNEL_VERSION]: {
    desc: 'Version number',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.PLATFORM]: {
    desc: 'Name of the platform',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.PLATFORM_NAME]: {
    desc: 'Name of the platform',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.PROJECT]: {
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.FIRST_RELEASE]: {
    desc: 'Issues first seen in a given release',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.FIRST_SEEN]: {
    desc: 'Issues first seen at a given time',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.DATE,
  },
  [FieldKey.HAS]: {
    desc: 'Determines if a tag or field exists in an event',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.RELEASE]: {
    desc: 'The version of your code deployed to an environment',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.RELEASE_BUILD]: {
    desc: 'The full version number that identifies the iteration',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.RELEASE_PACKAGE]: {
    desc: 'The identifier unique to the project or application',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.RELEASE_STAGE]: {
    desc: 'Stage of usage (i.e. Adopted, replaced, low)',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.RELEASE_VERSION]: {
    desc: 'An abbreviated version number of the build',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.SDK_NAME]: {
    desc: 'Name of the platform that sent the event',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.SDK_VERSION]: {
    desc: 'Version of the platform that sent the event',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.STACK_ABS_PATH]: {
    desc: 'Absolute path to the source file',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.STACK_COLNO]: {
    desc: 'Column number of the call starting at 1',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.NUMBER,
  },
  [FieldKey.STACK_FILENAME]: {
    desc: 'Relative path to the source file from the root directory',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.STACK_FUNCTION]: {
    desc: 'Name of function being called',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.STACK_IN_APP]: {
    desc: 'Indicates if frame is related to relevant code in stack trace',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.BOOLEAN,
  },
  [FieldKey.STACK_LINENO]: {
    desc: 'Line number of the call starting at 1',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.NUMBER,
  },
  [FieldKey.STACK_MODULE]: {
    desc: 'Platform specific module path',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.STACK_PACKAGE]: {
    desc: 'The package the frame is from',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.STACK_RESOURCE]: {
    desc: 'The package the frame is from',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.STACK_STACK_LEVEL]: {
    desc: 'Number of frames per stacktrace',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.TIMES_SEEN]: {
    desc: 'Total number of events',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.TIMESTAMP]: {
    desc: 'The time an event finishes',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.DATE,
  },
  [FieldKey.TIMESTAMP_TO_HOUR]: {
    desc: 'Rounded down to the nearest day',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.DATE,
  },
  [FieldKey.TIMESTAMP_TO_DAY]: {
    desc: 'Rounded down to the nearest hour',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.DATE,
  },
  [FieldKey.TITLE]: {
    desc: 'Error or transaction name identifier',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.TRACE]: {
    desc: 'The trace identification number',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.TRACE_PARENT_SPAN]: {
    desc: 'Span identification number of the parent to the event',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.TRACE_SPAN]: {
    desc: 'Span identification number of the root span ',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.TRANSACTION]: {
    desc: 'Error or transaction name identifier',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.TRANSACTION_OP]: {
    desc: 'The trace identification number',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.TRANSACTION_DURATION]: {
    desc: 'Span identification number of the parent to the event',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.DURATION,
  },
  [FieldKey.TRANSACTION_STATUS]: {
    desc: 'Span identification number of the root span ',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.USER]: {
    desc: 'User identification value',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.USER_DISPLAY]: {
    desc: 'The first user field available of email, username, ID and IP',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.USER_EMAIL]: {
    desc: 'Email address of the user',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.USER_ID]: {
    desc: 'Application specific internal identifier of the user',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.USER_IP]: {
    desc: 'IP Address of the user',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
  [FieldKey.USER_USERNAME]: {
    desc: 'Username of the user',
    kind: FieldKind.FIELD,
    valueType: FieldValueType.STRING,
  },
};

export const ISSUE_FIELDS = [
  FieldKey.DEVICE_ARCH,
  FieldKey.DEVICE_BRAND,
  FieldKey.DEVICE_LOCALE,
  FieldKey.DEVICE_MODEL_ID,
  FieldKey.DEVICE_ORIENTATION,
  FieldKey.DEVICE_UUID,
  FieldKey.ERROR_HANDLED,
  FieldKey.ERROR_MECHANISM,
  FieldKey.ERROR_TYPE,
  FieldKey.ERROR_UNHANDLED,
  FieldKey.ERROR_VALUE,
  FieldKey.EVENT_TYPE,
  FieldKey.GEO_CITY,
  FieldKey.GEO_COUNTRY_CODE,
  FieldKey.GEO_REGION,
  FieldKey.HTTP_METHOD,
  FieldKey.HTTP_URL,
  FieldKey.LOCATION,
  FieldKey.MESSAGE,
  FieldKey.OS_BUILD,
  FieldKey.OS_KERNEL_VERSION,
  FieldKey.PLATFORM,
  FieldKey.RELEASE,
  FieldKey.SDK_NAME,
  FieldKey.SDK_VERSION,
  FieldKey.STACK_ABS_PATH,
  FieldKey.STACK_FILENAME,
  FieldKey.STACK_FUNCTION,
  FieldKey.STACK_MODULE,
  FieldKey.STACK_PACKAGE,
  FieldKey.STACK_STACK_LEVEL,
  FieldKey.TIMESTAMP,
  FieldKey.TITLE,
  FieldKey.USER_EMAIL,
  FieldKey.USER_ID,
  FieldKey.USER_IP,
  FieldKey.USER_USERNAME,
];

/**
 * Refer to src/sentry/snuba/events.py, search for Columns
 */
export const DISCOVER_FIELDS = [
  FieldKey.ID,
  // issue.id and project.id are omitted on purpose.
  // Customers should use `issue` and `project` instead.
  FieldKey.TIMESTAMP,
  // time is omitted on purpose.
  // Customers should use `timestamp` or `timestamp.to_hour`.
  FieldKey.TIMESTAMP_TO_HOUR,
  FieldKey.TIMESTAMP_TO_DAY,

  FieldKey.CULPRIT,
  FieldKey.LOCATION,
  FieldKey.MESSAGE,
  FieldKey.PLATFORM_NAME,
  FieldKey.ENVIRONMENT,
  FieldKey.RELEASE,
  FieldKey.DIST,
  FieldKey.TITLE,
  FieldKey.EVENT_TYPE,
  // tags.key and tags.value are omitted on purpose as well.

  FieldKey.TRANSACTION,
  FieldKey.USER,
  FieldKey.USER_ID,
  FieldKey.USER_EMAIL,
  FieldKey.USER_USERNAME,
  FieldKey.USER_IP,
  FieldKey.SDK_NAME,
  FieldKey.SDK_VERSION,
  FieldKey.HTTP_METHOD,
  FieldKey.HTTP_REFERER,
  FieldKey.HTTP_URL,
  FieldKey.OS_BUILD,
  FieldKey.OS_KERNEL_VERSION,
  FieldKey.DEVICE_NAME,
  FieldKey.DEVICE_BRAND,
  FieldKey.DEVICE_LOCALE,
  FieldKey.DEVICE_UUID,
  FieldKey.DEVICE_ARCH,
  FieldKey.DEVICE_FAMILY,
  FieldKey.DEVICE_BATTERY_LEVEL,
  FieldKey.DEVICE_ORIENTATION,
  FieldKey.DEVICE_SIMULATOR,
  FieldKey.DEVICE_ONLINE,
  FieldKey.DEVICE_CHARGING,
  FieldKey.GEO_COUNTRY_CODE,
  FieldKey.GEO_REGION,
  FieldKey.GEO_CITY,
  FieldKey.ERROR_TYPE,
  FieldKey.ERROR_VALUE,
  FieldKey.ERROR_MECHANISM,
  FieldKey.ERROR_HANDLED,
  FieldKey.ERROR_UNHANDLED,
  FieldKey.LEVEL,
  FieldKey.STACK_ABS_PATH,
  FieldKey.STACK_FILENAME,
  FieldKey.STACK_PACKAGE,
  FieldKey.STACK_MODULE,
  FieldKey.STACK_FUNCTION,
  FieldKey.STACK_IN_APP,
  FieldKey.STACK_COLNO,
  FieldKey.STACK_LINENO,
  FieldKey.STACK_STACK_LEVEL,
  // contexts.key and contexts.value omitted on purpose.

  // Transaction event fields.
  FieldKey.TRANSACTION_DURATION,
  FieldKey.TRANSACTION_OP,
  FieldKey.TRANSACTION_STATUS,

  FieldKey.TRACE,
  FieldKey.TRACE_SPAN,
  FieldKey.TRACE_PARENT_SPAN,

  // Field alises defined in src/sentry/api/event_search.py
  FieldKey.PROJECT,
  FieldKey.ISSUE,
  FieldKey.USER_DISPLAY,
];

export const getFieldDefinition = (key: string): FieldDefinition | null => {
  return FIELDS[key] ?? null;
};
