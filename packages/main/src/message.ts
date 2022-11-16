
export interface Trace {
  eid   : number;
  name  : 'trace';
  type  : 'string';
  value : string;
}

export default class Message {

  private trace               : Trace;
  private time                : Date;
  private message             : string;
  private mod                 : string;
  private ct                  = 4;

  constructor(trace:Trace){

    this.trace = trace;
    this.time =  new Date();
    this.mod = 'txt';
    this.message = '';
    this.parseMessage();

  }

private parseMessage (){
    const value = this.trace.value;
    const reg = /\[{1}(.+)]/g;
  if(value.match(reg)){
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain
    this.mod = value.match(reg)?.toString().replace(/\[/g,'').replace(/\]/g,'')!;
    const msgArr = value.split((/\]/));
    this.message = msgArr[1].replace(/[\s]/, '');
  }

}

public getCmdMessage(){
  return {
    time: this.time.toLocaleString(),
    mod: this.mod,
    ct: this.ct,
    terminal: this.message,
  };

}
}

