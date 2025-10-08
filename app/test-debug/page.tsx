'use client';

export default function TestDebugPage() {
  const testIcon = '/icon/today content.svg';
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Icon Debug Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Direct Image Test:</h2>
          <img 
            src={testIcon} 
            alt="Test Icon" 
            className="w-12 h-12 border border-gray-300"
            onError={(e) => {
              console.error('Direct image failed to load:', testIcon);
              e.currentTarget.style.border = '2px solid red';
            }}
            onLoad={() => console.log('Direct image loaded successfully:', testIcon)}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">String Check Test:</h2>
          <p>Icon path: "{testIcon}"</p>
          <p>Ends with .svg: {testIcon.endsWith('.svg') ? 'true' : 'false'}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Conditional Rendering Test:</h2>
          {testIcon.endsWith('.svg') ? (
            <img 
              src={testIcon} 
              alt="Conditional Icon" 
              className="w-12 h-12 border border-green-300"
              onError={(e) => {
                console.error('Conditional image failed to load:', testIcon);
                e.currentTarget.style.border = '2px solid red';
              }}
              onLoad={() => console.log('Conditional image loaded successfully:', testIcon)}
            />
          ) : (
            <span className="text-4xl">{testIcon}</span>
          )}
        </div>
      </div>
    </div>
  );
}
