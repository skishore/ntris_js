enum Action {
  LEFT = 0,
  RIGHT = 1,
  DOWN = 2,
  ROTATE_CW = 3,
  ROTATE_CCW = 4,
  DROP = 5,
  HOLD = 6,
  START = 7,
};

class ActionData {
  public NUMACTIONS:number = 8;

  public repeats = function(action:Action):boolean {
    return this._repeats[action];
  };

  public label = function(action:Action):string {
    return this._label[action];
  };

  private _label:string[] = [
    'Left',
    'Right',
    'Down',
    'Rotate CW',
    'Rotate CCW',
    'Drop',
    'Hold',
    'Start',
  ];

  private _repeats:boolean[] = [
    true,
    true,
    true,
    false,
    false,
    false,
    false,
    false,
  ];
};
