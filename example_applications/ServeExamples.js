const libFable = require('fable');

const defaultFableSettings = (
{
	Product: 'PictSectionObjectEditorExampleServer',
	ProductVersion: '1.0.0',
	APIServerPort: 9060
});

// Initialize Fable
let _Fable = new libFable(defaultFableSettings);

// Now initialize the Restify ServiceServer Fable Service
_Fable.serviceManager.addServiceType('OratorServiceServer', require('orator-serviceserver-restify'));
_Fable.serviceManager.instantiateServiceProvider('OratorServiceServer',
{
	RestifyConfiguration: { strictNext: true }
});

// Now add the orator service to Fable
_Fable.serviceManager.addServiceType('Orator', require('orator'));
let _Orator = _Fable.serviceManager.instantiateServiceProvider('Orator', {});

let tmpAnticipate = _Fable.newAnticipate();

// Initialize the Orator server
tmpAnticipate.anticipate(_Orator.initialize.bind(_Orator));

tmpAnticipate.anticipate(
	(fStageComplete) =>
	{
		_Orator.addStaticRoute(`${__dirname}/`);
		return fStageComplete();
	});

// Now start the service server.
tmpAnticipate.anticipate(_Orator.startService.bind(_Orator));

tmpAnticipate.wait(
	(pError) =>
	{
		if (pError)
		{
			_Fable.log.error('Error initializing Orator Service Server: ' + pError.message, pError);
		}
		_Fable.log.info('Orator Service Server Initialized on port ' + defaultFableSettings.APIServerPort);
	});
