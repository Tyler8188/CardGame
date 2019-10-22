/**
 * tyler
 */
export default class EventManager {

    private static events:Map<string, Array<EventHandler>> = new Map<string, Array<EventHandler>>();

    static registEvent(eventName:string, callBack:Function, target:object):void
    {
        if (eventName == undefined || callBack == undefined || target == undefined)
        {
            throw Error("registEvent error");
        }

        if (EventManager.events[eventName] == undefined)
        {
            EventManager.events[eventName] = new Array<EventHandler>();
        }

        let handler = new EventHandler(target, callBack);
        EventManager.events[eventName].push(handler);
    }

    static dispatchEvent(eventName:string, param?:any):void
    {
        let handlers = EventManager.events[eventName];
        if (handlers == undefined)
        {
            return;
        }

        let handlerLen = handlers.length;
        for (let i = 0; i < handlerLen; ++i)
        {
            let handler = handlers[i];
            if (handler)
            {
                try
                {
                    handler.function.call(handler.target, param);
                } 
                catch(e)
                {
                    console.log(e.stack.toString());
                }
            }
        }
    }
    
    static unregistEvent(eventName:string, callBack:Function, target:object):void
    {
        let handlers = EventManager.events[eventName];
        if (handlers == undefined) return;

        let handlerLen = handlers.length;
        for (let i = 0; i < handlerLen; ++i)
        {
            let handler = handlers[i];
            if (handler != undefined && handler.target == target && handler.function == callBack )
            {
               handlers[i] == undefined;
               break;
            }
        }
    }
}


class EventHandler
{
    target: object;
    function: Function;

    constructor(target:object, func:Function)
    {
        this.target = target;
        this.function = func;
    }
}