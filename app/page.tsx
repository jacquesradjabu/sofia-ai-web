"use client";
import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import Loading from '@/components/Loading';
import MakeMessageCall from '@/components/MakeMessageCall';
import ReactMarkdown from 'react-markdown';



const linkBACKEND = 'https://chattwilioai-backend.onrender.com/api/questions';

interface FormInputs {
   message: string;
}

export default function Home() {
   const [error, setError] = useState("");
   const [loading, setLoading] = useState(true);
   const [chatHistory, setChatHistory] = useState<Array<{ role: string; parts: string; }>>([]);
   const { register, handleSubmit, reset } = useForm<FormInputs>();

   const onSubmit: SubmitHandler<FormInputs> = async (data) => {
      setLoading(true);
      if (!data.message.trim()) {
         setError('Error: Please enter something!');
         return;
      }
      try {
         const options = {
            method: 'POST',
            body: JSON.stringify({
               history: chatHistory,
               message: data.message
            }),
            headers: {
               'Content-Type': 'application/json'
            }
         }
         const response = await fetch(linkBACKEND, options);
         const result = await response.text();
         setChatHistory(function (prevChatHistory) {
            return [...prevChatHistory, {
               role: 'user',
               parts: data.message,
            },
            {
               role: 'model',
               parts: result
            }];
         });
         setLoading(false);
         reset();
      } catch (error) {
         setError('Something went wrong! Please try again later.');
         setLoading(false);
      }
   };
   return (
      <div className='bg-gray-100 flex w-full h-full'>
         <aside className='h-full border-b border-gray-200 bg-white hidden md:block'>
            <MakeMessageCall />
         </aside>
         <aside className='flex-1 h-full w-full'>
            <div className="w-full h-full bg-white rounded-lg shadow-lg overflow-hidden flex-1">
               <div className="flex flex-col p-4 space-y-4 overflow-y-auto h-96">
                  {error && <p className='text-red-500 text-center'>{error}</p>}
                  <p>Hello! How can I help you today?</p>
                  {
                     loading ? (
                        <div className='flex w-full h-full items-center justify-center'>
                           <Loading />
                        </div>
                     ) : null
                  }
                  {chatHistory?.map((chatItem, index) => (
                     <div
                        key={index}
                        className={`flex ${chatItem?.role == 'model' ? 'justify-start' : 'justify-end'}`}
                     >
                        <p className={`p-4 rounded-md ${chatItem?.role == 'model' ? 'bg-gray-200' : 'bg-blue-500 text-white'}`}>

                           <p>{chatItem?.role}:</p>
                           <ReactMarkdown>{chatItem?.parts}</ReactMarkdown>

                        </p>
                     </div>

                  ))}
               </div>
               {/* form to send data to the server */}
               <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <form onSubmit={handleSubmit(onSubmit)}>
                     <div className="flex items-center space-x-4">
                        <input
                           {...register("message")}
                           type="text"
                           placeholder="Type a message..."
                           className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                           type="submit"
                           className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                           Send
                        </button>
                     </div>
                  </form>
               </div>
            </div>
         </aside>
      </div>
   );
}